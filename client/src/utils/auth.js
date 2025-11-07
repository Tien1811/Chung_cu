// src/utils/auth.js
const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const setAccessToken = (token) => localStorage.setItem(ACCESS_KEY, token);
export const removeAccessToken = () => localStorage.removeItem(ACCESS_KEY);

export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export const setRefreshToken = (token) => localStorage.setItem(REFRESH_KEY, token);
export const removeRefreshToken = () => localStorage.removeItem(REFRESH_KEY);

export const clearAuth = () => {
  removeAccessToken();
  removeRefreshToken();
};

// (tuỳ) điều hướng về login khi hết hạn
export const redirectToLogin = () => {
  clearAuth();
  window.location.replace('/login');
};
