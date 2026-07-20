import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.150:3000/api",
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
};

export default apis;
