'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Parse token and user from query or window.location
    // If backend redirects to this page with token in query string
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      router.push('/dashboard');
      return;
    }
    // If backend responds with JSON, try to parse from window.name or other method
    // You may need to adjust this logic based on your backend redirect method
    // If nothing found, redirect to login
    router.push('/login');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen text-white">
      <span>Signing you in...</span>
    </div>
  );
}
