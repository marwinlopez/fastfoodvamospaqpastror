import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn(
    "[apis] EXPO_PUBLIC_API_URL no está definida. Copia app/.env.example a app/.env y ajusta la IP de tu servidor."
  );
}

const api = axios.create({
  baseURL: API_URL,
  // 5s se quedaba corto en red móvil + túnel ngrok, sobre todo justo al
  // abrir la app (restaurar sesión) cuando la conexión recién se establece:
  // un timeout ahí no es "sesión inválida", pero bota al usuario al login
  // igual porque restoreSession() no distingue la causa.
  timeout: 15000,
});

// Token en memoria: los interceptores necesitan leerlo de forma síncrona en
// cada request, y expo-secure-store es asíncrono. AuthService lo mantiene
// sincronizado con el almacenamiento seguro (ver app/services/AuthService.jsx).
let currentToken = null;
let unauthorizedHandler = null;

export const setAuthToken = (token) => {
  currentToken = token;
};

export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

api.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }
    return Promise.reject(error);
  }
);

export const login = (payload) => api.post("/auth/login", payload);
export const getMe = () => api.get("/auth/me");

export const allProducts = () => api.get("/product/get-all");
export const productForId = (id) => api.get(`/product/${id}`);
export const recipeForId = (id) => api.get(`/recipe/${id}`);
export const recipeAll = () => api.get(`/recipe/`);
export const newRecipe = (payload) => api.post(`/recipe/create`, payload);
export const newIngredient = (payload) =>
  api.post(`/ingredient/create`, payload);
export const ingredientForId = (id) => api.get(`/ingredient/${id}`);
export const unitOfMeasurements = () => api.get("/unit/");
export const createProduct = (payload) => api.post("/product/create", payload);
export const updateProduct = (id, payload) => api.put(`/product/update/${id}`, payload);
export const restockProduct = (id, payload) => api.post(`/product/restock/${id}`, payload);
export const updateRecipe = (id, payload) => api.put(`/recipe/update/${id}`, payload);
export const deleteRecipe = (id) => api.delete(`/recipe/delete/${id}`);

export const updateIngredient = (id, payload) => api.put(`/ingredient/update/${id}`, payload);
export const deleteIngredient = (id) => api.delete(`/ingredient/delete/${id}`);

export const getMenuItems = () => api.get("/menu");
export const createMenuItem = (payload) => api.post("/menu/create", payload);
export const updateMenuItem = (id, payload) => api.put(`/menu/update/${id}`, payload);
export const deleteMenuItem = (id) => api.delete(`/menu/delete/${id}`);

// Categorías
export const getCategoryList = () => api.get("/category");
export const createCategory = (payload) => api.post("/category/create", payload);
export const updateCategory = (id, payload) => api.put(`/category/update/${id}`, payload);
export const deleteCategory = (id) => api.delete(`/category/delete/${id}`);

// Unidades (CRUD completo)
export const createUnit = (payload) => api.post("/unit/create", payload);
export const updateUnit = (id, payload) => api.put(`/unit/update/${id}`, payload);
export const deleteUnit = (id) => api.delete(`/unit/delete/${id}`);

// Personal
export const getStaffList = () => api.get("/staff");
export const createStaff = (payload) => api.post("/staff/create", payload);
export const updateStaff = (id, payload) => api.put(`/staff/update/${id}`, payload);
export const deleteStaff = (id) => api.delete(`/staff/delete/${id}`);

// Roles y Permisos
export const getRoleList = () => api.get("/role");
export const createRole = (payload) => api.post("/role/create", payload);
export const updateRole = (id, payload) => api.put(`/role/update/${id}`, payload);
export const deleteRole = (id) => api.delete(`/role/delete/${id}`);

// Empresa (multi-tenant): datos de marca, moneda y tema
export const getCompany = () => api.get("/company");
export const updateCompany = (payload) => api.put("/company/update", payload);

const apis = {
  setAuthToken,
  setUnauthorizedHandler,
  login,
  getMe,
  allProducts,
  productForId,
  recipeForId,
  recipeAll,
  newRecipe,
  newIngredient,
  ingredientForId,
  unitOfMeasurements,
  createProduct,
  updateProduct,
  restockProduct,
  updateRecipe,
  deleteRecipe,
  updateIngredient,
  deleteIngredient,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory,
  createUnit,
  updateUnit,
  deleteUnit,
  getStaffList,
  createStaff,
  updateStaff,
  deleteStaff,
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  getCompany,
  updateCompany,
};

export default apis;
