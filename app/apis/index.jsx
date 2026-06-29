import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.5:3000/api",
  timeout: 5000,
});

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

export const updateRecipe = (id, payload) => api.put(`/recipe/update/${id}`, payload);
export const deleteRecipe = (id) => api.delete(`/recipe/delete/${id}`);
export const deleteIngredient = (id) => api.delete(`/ingredient/delete/${id}`);

const apis = {
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
  updateRecipe,
  deleteRecipe,
  deleteIngredient,
};

export default apis;
