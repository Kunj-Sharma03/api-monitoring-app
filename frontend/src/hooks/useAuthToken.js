"use client";

import { useEffect, useState } from "react";

export default function useAuthToken() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem("token");
      console.log('Token retrieved from localStorage:', storedToken);
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      console.log('Retrieved token:', token);
      try {
        if (typeof token !== 'string' || !token.includes('.')) {
          throw new Error('Token is not a valid JWT string');
        }
        const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
        if (!payload || typeof payload !== 'object') {
          throw new Error('Invalid token payload');
        }
      } catch (err) {
        console.error('Invalid token detected, clearing from localStorage:', err.message);
        localStorage.removeItem('token');
        setToken(null);
      }
    } else {
      console.warn('No token found');
    }
  }, [token]);

  return { token, loading };
}
