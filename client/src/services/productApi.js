// src/services/productApi.js
import api from './api';

export const getProducts   = ()         => api.get('/products').then((r) => r.data.data);
export const createProduct = (data)     => api.post('/products', data).then((r) => r.data.data);
export const updateProduct = (id, data) => api.patch(`/products/${id}`, data).then((r) => r.data.data);
