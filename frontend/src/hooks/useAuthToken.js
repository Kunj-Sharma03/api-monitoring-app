"use client";

import { useEffect, useState } from "react";

export default function useAuthToken() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  return { token, loading };
}
