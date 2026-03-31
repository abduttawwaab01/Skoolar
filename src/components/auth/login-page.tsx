'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { School, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { LoginOverlay } from '@/components/shared/login-overlay';
import { playLogin, playError } from '@/lib/ui-sounds';

export function LoginPage({ onSwitchToRegister }: { onSwitchToRegister?: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
        toast.error('Login failed ❌', {
          description: 'Invalid email or password.',
        });
        playError();
      } else if (result?.ok) {
        toast.success('Welcome back! 🎉', {
          description: 'Redirecting to dashboard...',
        });
        playLogin();
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info('Password Reset', {
      description: 'Please contact your school administrator to reset your password.',
      duration: 5000,
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-80 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-teal-100/50 blur-3xl" />
        <div className="absolute top-1/4 left-1/4 size-40 rounded-full bg-emerald-200/30 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 size-60 rounded-full bg-teal-200/20 blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle, #059669 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left - Branding */}
          <div className="hidden lg:flex flex-col items-start gap-6">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                <School className="size-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Skoolar</h1>
                <p className="text-sm text-gray-500">📚 Multi-School Management Platform</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                Everything your school needs,
                <span className="text-emerald-600"> in one place. ✨</span>
              </h2>
              <p className="text-gray-600 leading-relaxed max-w-md">
                Streamline administration, enhance learning, and connect your entire school community with our comprehensive management platform.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-3 mt-4 max-w-md">
              {[
                { label: 'Student Management', count: '847+', emoji: '👩‍🎓' },
                { label: 'Academic Tracking', count: '100%', emoji: '📈' },
                { label: 'Finance & Fees', count: '₦45M+', emoji: '💰' },
                { label: 'Library System', count: '3.4K+', emoji: '📚' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur p-3 shadow-sm">
                  <p className="text-lg font-bold text-emerald-600">{item.count} <span className="text-base">{item.emoji}</span></p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="border-0 shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-xl">
              <CardHeader className="space-y-1 pb-4 text-center">
                <div className="flex lg:hidden items-center justify-center gap-2 mb-2">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <School className="size-5" />
                  </div>
                  <h1 className="text-xl font-bold">Skoolar</h1>
                </div>
                <CardTitle className="text-2xl font-bold">👋 Welcome Back</CardTitle>
                <CardDescription>
                  Enter your credentials to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  )}

                  {/* Email field */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@school.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-600/20 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="size-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <Separator className="my-4" />

                <p className="text-xs text-center text-muted-foreground">
                  Contact your school administrator to get your login credentials.
                </p>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="mt-4 space-y-2">
              {onSwitchToRegister && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-gray-500 hover:text-gray-700"
                  onClick={onSwitchToRegister}
                >
                  <UserPlus className="size-4 mr-2" />
                  Don&apos;t have an account? Create one
                </Button>
              )}
              <p className="text-center text-xs text-gray-400">
                &copy; {new Date().getFullYear()} Skoolar Platform. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
      <LoginOverlay />
    </div>
  );
}
