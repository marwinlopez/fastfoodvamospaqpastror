import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.0.101:8080/api",
  timeout: 500, // Timeout de 2 segundos para evitar que la UI se cuelgue si el servidor no responde
});

export const allProducts = () => api.get("/product/");
export const productForId = (id) => api.get(`/product/${id}`);
export const recipeForId = (id) => api.get(`/recipe/${id}`);
export const recipeAll = () => api.get(`/recipe/`);
export const newRecipe = (payload) => api.post(`/recipe/create`, payload);
export const newIngredient = (payload) =>
  api.post(`/ingredient/create`, payload);
export const ingredientForId = (id) => api.get(`/ingredient/${id}`);
export const unitOfMeasurements = () => api.get("/unit/");

// export const allPosts = () => api.get('/posts/all')

// export const createPosts = payload => api.post('/posts/create-posts', payload)

// export const getPostById = id => api.get(`/posts/${id}`)

const apis = {
  allProducts,
  productForId,
  recipeForId,
  recipeAll,
  newRecipe,
  newIngredient,
  ingredientForId,
  unitOfMeasurements,
};

export default apis;
