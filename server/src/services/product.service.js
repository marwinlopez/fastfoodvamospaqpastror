const productRepository = require("../repositories/product.repository");
const divisasService = require("./divisas.service");

class ProductService {
  async getAllProducts() {
    const products = await productRepository.getAll();
    const exchange = await divisasService.getExchangeRate("DolarToday");

    if (exchange && exchange.quote) {
      const quote = parseFloat(exchange.quote);
      return products.map((p) => {
        const basePrice = parseFloat(p.precioCompra || p.price || 0);
        const convertedPrice = quote * basePrice;
        return {
          ...p,
          price: convertedPrice,
          precioCompra: convertedPrice,
        };
      });
    }

    return products.map((p) => ({
      ...p,
      price: parseFloat(p.precioCompra || p.price || 0),
    }));
  }

  async getProductById(id) {
    return await productRepository.getById(id);
  }

  async createProducts(productsList) {
    return await productRepository.createBatch(productsList);
  }

  async updateProduct(id, updateData) {
    return await productRepository.update(id, updateData);
  }

  // Reposición de inventario: suma unidades individuales al stock.
  // El cliente traduce empaques a unidades (ej. 1 caja de 36 -> 36 unidades).
  async restockProduct(id, unidades) {
    const qty = parseFloat(unidades);
    if (!qty || isNaN(qty)) {
      throw new Error("La cantidad de unidades a reponer es inválida");
    }
    const updated = await productRepository.addStock(id, qty);
    if (!updated) {
      throw new Error("Producto no encontrado");
    }
    return updated;
  }

  async searchProducts(query) {
    return await productRepository.searchByNameOrCoin(query);
  }
}

module.exports = new ProductService();
