'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SessionProvider } from 'next-auth/react';
import { School } from 'lucide-react';
import { LoginPage } from '@/components/auth/login-page';
import { RegisterPage } from '@/components/auth/register-page';
import { Toaster } from 'sonner';

function AuthContent() {
  const [authView, setAuthView] = useState<'login' | 'register'>('register');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <School className="h-6 w-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {authView === 'login' ? 'Welcome back' : 'Create your school account'}
          </h1>
          <p className="text-gray-600 mt-2">
            {authView === 'login' 
              ? 'Log in to access your dashboard' 
              : 'Get started with your school in minutes'}
          </p>
        </div>
        
        {authView === 'login' ? (
          <LoginPage onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    </div>
  );
}

export default function RegisterPageRoute() {
  return (
    <SessionProvider>
      <AuthContent />
      <Toaster position="top-right" richColors closeButton />
    </SessionProvider>
  );
}
