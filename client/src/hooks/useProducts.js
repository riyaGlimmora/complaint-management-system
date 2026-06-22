// src/hooks/useProducts.js
import { useFetch } from './useFetch';
import { getProducts } from '../services/productApi';

export function useProducts() {
  return useFetch(getProducts, []);
}
