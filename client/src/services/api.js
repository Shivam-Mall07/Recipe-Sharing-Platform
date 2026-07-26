import axios from 'axios';

// Fallback to local server if environment variable isn't set
const API_URL = 'http://localhost:5000/api';

// Create a configured Axios instance
const api = axios.create({
  baseURL: API_URL
});

// Interceptor to automatically add JWT token to Authorization header if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Centralized API calls grouping
const apiService = {
  // --- AUTH SERVICES ---
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (userData) => {
    const response = await api.post('/auth/login', userData);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // --- RECIPE SERVICES ---
  getAllRecipes: async (category = '') => {
    const url = category ? `/recipes?category=${category}` : '/recipes';
    const response = await api.get(url);
    return response.data;
  },
  getRecipeById: async (id) => {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },
  // Uses FormData since it involves Multer image file upload
  createRecipe: async (recipeData) => {
    const response = await api.post('/recipes', recipeData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  // Uses FormData since it may involve optional new Multer image file upload
  updateRecipe: async (id, recipeData) => {
    const response = await api.put(`/recipes/${id}`, recipeData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  deleteRecipe: async (id) => {
    const response = await api.delete(`/recipes/${id}`);
    return response.data;
  },
  searchRecipes: async (query) => {
    const response = await api.get(`/recipes/search?q=${query}`);
    return response.data;
  },

  // --- RATING SERVICES ---
  rateRecipe: async (ratingData) => {
    const response = await api.post('/ratings', ratingData);
    return response.data;
  },
  updateRating: async (id, ratingData) => {
    const response = await api.put(`/ratings/${id}`, ratingData);
    return response.data;
  },

  // --- REVIEW SERVICES ---
  addReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },
  updateReview: async (id, reviewData) => {
    const response = await api.put(`/reviews/${id}`, reviewData);
    return response.data;
  },
  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  }
};

export default apiService;
