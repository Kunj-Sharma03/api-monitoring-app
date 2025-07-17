'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Particles from '@/components/background/Particles';


export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || 'Registration failed');
        return;
      }

      if (typeof data.token !== 'string' || !data.token.includes('.')) {
        setError('Invalid token received');
        return;
      }
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      {/* Back to Home Button */}
      <Link href="/" className="absolute top-6 left-6 z-20 flex items-center space-x-2 text-white/70 hover:text-white transition-colors group">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <div className="absolute inset-0 w-full h-full">
        <Particles
          particleColors={["#ffffff", "#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
          className="w-full h-full"
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="backdrop-blur-sm bg-black/3 border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto">
          {/* App Logo */}
          <div className="flex justify-center mb-4">
            <img 
              src="/logo192.png" 
              alt="App Logo" 
              className="w-16 h-16 opacity-90"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Register
          </h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="email"
              className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button type="submit" className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold p-3 rounded-lg transition-all border border-white/20">
              Create Account
            </button>
          </form>
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-white/20" />
            <span className="mx-4 text-white/60 text-sm">or</span>
            <div className="flex-grow h-px bg-white/20" />
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              className="bg-white/10 hover:bg-white/20 p-3 rounded-full border border-white/20 transition-all"
              onClick={() => {
                window.location.href = 'http://localhost:5000/api/auth/google';
              }}
              aria-label="Sign up with Google"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

