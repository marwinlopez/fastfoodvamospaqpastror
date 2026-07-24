const productService = require("../services/product.service");
const asyncHandler = require("../utils/asyncHandler");

exports.getAll = asyncHandler(async (req, res) => {
  const data = await productService.getAllProducts();
  res.json({ status: true, data });
});

exports.update = asyncHandler(async (req, res) => {
  const { body, params } = req;
  await productService.updateProduct(params.id, body);
  res.status(202).json({ message: "Registro actualizado" });
});

exports.create = asyncHandler(async (req, res) => {
  const { products } = req.body;
  await productService.createProducts(products);
  res.json({ status: true });
});

exports.search = asyncHandler(async (req, res) => {
  const { query } = req.body;
  const data = await productService.searchProducts(query);
  res.json({ data });
});

exports.restock = asyncHandler(async (req, res) => {
  const { unidades } = req.body;
  const product = await productService.restockProduct(req.params.id, unidades);
  res.json({ success: true, product });
});

exports.getById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }
  res.json({ success: true, product });
});
