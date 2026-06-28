import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";
import apis from "../apis";

const CACHE_KEYS = {
  PRODUCTS: "@catalog_products",
  UNITS: "@catalog_units",
  QUEUE: "@sync_queue",
};

export const BackgroundSyncService = {
  // Pre-carga asíncrona de catálogos en segundo plano
  async preloadCatalogCache() {
    try {
      console.log("[SyncService] Iniciando pre-carga de catálogos...");

      const [productsRes, unitsRes] = await Promise.allSettled([
        apis.allProducts(),
        apis.unitOfMeasurements(),
      ]);

      if (productsRes.status === "fulfilled" && productsRes.value?.data) {
        const productsList =
          productsRes.value.data?.products ||
          (Array.isArray(productsRes.value.data) ? productsRes.value.data : []);

        if (productsList.length > 0) {
          await AsyncStorage.setItem(
            CACHE_KEYS.PRODUCTS,
            JSON.stringify(productsList)
          );
          console.log("[SyncService] Caché de productos actualizada.");
        }
      }

      if (unitsRes.status === "fulfilled" && unitsRes.value?.data) {
        const unitsList =
          unitsRes.value.data?.unitOf ||
          (Array.isArray(unitsRes.value.data) ? unitsRes.value.data : []);

        if (unitsList.length > 0) {
          const unitNames = [
            "Seleccionar...",
            ...unitsList.map((u) => u.name || u),
          ];
          await AsyncStorage.setItem(CACHE_KEYS.UNITS, JSON.stringify(unitNames));
          console.log("[SyncService] Caché de unidades de medida actualizada.");
        }
      }
    } catch (error) {
      console.log("[SyncService] Error en la pre-carga asíncrona:", error);
    }
  },

  // Obtener productos de la caché local instantáneamente
  async getCachedProducts() {
    try {
      const data = await AsyncStorage.getItem(CACHE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Obtener unidades de medida de la caché local instantáneamente
  async getCachedUnits() {
    try {
      const data = await AsyncStorage.getItem(CACHE_KEYS.UNITS);
      return data ? JSON.parse(data) : ["Seleccionar..."];
    } catch (e) {
      return ["Seleccionar..."];
    }
  },

  // Añadir un nuevo producto a la caché local instantáneamente
  async addProductToCache(product) {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEYS.PRODUCTS);
      const cachedList = cachedData ? JSON.parse(cachedData) : [];
      const exists = cachedList.some(
        (p) =>
          p.producto &&
          p.producto.toUpperCase() === product.producto.toUpperCase()
      );
      if (!exists) {
        cachedList.push(product);
        await AsyncStorage.setItem(
          CACHE_KEYS.PRODUCTS,
          JSON.stringify(cachedList)
        );
        console.log("[SyncService] Nuevo producto añadido a la caché local.");
      }
    } catch (error) {
      console.log("[SyncService] Error al añadir producto a la caché:", error);
    }
  },

  // Actualizar un producto existente en la caché local
  async updateProductInCache(id, updatedFields) {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEYS.PRODUCTS);
      const cachedList = cachedData ? JSON.parse(cachedData) : [];
      const updatedList = cachedList.map((p) => {
        if ((p.productId || p.id) === id) {
          return { ...p, ...updatedFields };
        }
        return p;
      });
      await AsyncStorage.setItem(
        CACHE_KEYS.PRODUCTS,
        JSON.stringify(updatedList)
      );
      console.log("[SyncService] Producto actualizado en la caché local.");
    } catch (error) {
      console.log("[SyncService] Error al actualizar producto en caché:", error);
    }
  },

  // Encolar acción offline
  async enqueueSyncAction(type, payload) {
    try {
      console.log(`[SyncService] Encolando acción offline: ${type}`);
      const queueData = await AsyncStorage.getItem(CACHE_KEYS.QUEUE);
      const queue = queueData ? JSON.parse(queueData) : [];
      queue.push({ id: Date.now().toString(), type, payload });
      await AsyncStorage.setItem(CACHE_KEYS.QUEUE, JSON.stringify(queue));

      // Intentar procesar en segundo plano si recuperó conectividad
      this.processSyncQueue();
    } catch (error) {
      console.log("[SyncService] Error al encolar acción:", error);
    }
  },

  // Procesar cola en segundo plano
  async processSyncQueue() {
    try {
      const netState = await Network.getNetworkStateAsync();
      const isConnected = netState.isConnected && netState.isInternetReachable;

      if (!isConnected) {
        console.log(
          "[SyncService] Dispositivo offline. Sincronización en segundo plano en espera."
        );
        return;
      }

      const queueData = await AsyncStorage.getItem(CACHE_KEYS.QUEUE);
      const queue = queueData ? JSON.parse(queueData) : [];

      if (queue.length === 0) {
        return;
      }

      console.log(
        `[SyncService] Sincronizando ${queue.length} acciones en segundo plano...`
      );

      const remainingQueue = [];

      for (const action of queue) {
        try {
          if (action.type === "newRecipe") {
            await apis.newRecipe(action.payload);
          } else if (action.type === "newIngredient") {
            await apis.newIngredient(action.payload);
          } else if (action.type === "newProduct") {
            await apis.createProduct(action.payload);
          } else if (action.type === "editProduct") {
            await apis.updateProduct(action.payload.id, action.payload.payload);
          }
          console.log(
            `[SyncService] Acción de cola sincronizada: ${action.type}`
          );
        } catch (err) {
          console.log(
            `[SyncService] Re-encolando acción fallida: ${action.type}`,
            err
          );
          remainingQueue.push(action);
        }
      }

      await AsyncStorage.setItem(CACHE_KEYS.QUEUE, JSON.stringify(remainingQueue));
    } catch (error) {
      console.log("[SyncService] Error procesando cola de sincronización:", error);
    }
  },
};
