"use client";

import { useEffect, useState } from "react";

export default function useAuthToken() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem("token");
      // Removed sensitive token logging
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      // Removed sensitive token logging
      try {
        if (typeof token !== 'string' || !token.includes('.')) {
          throw new Error('Token is not a valid JWT string');
        }
        const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
        if (!payload || typeof payload !== 'object') {
          throw new Error('Invalid token payload');
        }
      } catch (err) {
        console.error('Invalid token detected, clearing from localStorage:', err.message); // Only logs error message, not token
        localStorage.removeItem('token');
        setToken(null);
      }
    } else {
      console.warn('No token found'); // Only logs warning, not token
    }
  }, [token]);

  return { token, loading };
}
