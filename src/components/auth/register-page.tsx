'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { School, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, User, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { soundEffects } from '@/lib/ui-sounds';

export function RegisterPage({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    registrationCode: '',
    schoolName: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.registrationCode.trim()) newErrors.registrationCode = 'Registration code is required';
    if (!formData.schoolName.trim()) newErrors.schoolName = 'School name is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          registrationCode: formData.registrationCode,
          schoolName: formData.schoolName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error('Registration Failed ❌', {
          description: data.error || 'Something went wrong.',
        });
        soundEffects.error();
        return;
      }

      toast.success('Account created! 🎉', {
        description: 'Your account has been created. You can now sign in.',
      });
      soundEffects.success();

      onSwitchToLogin();
    } catch {
      toast.error('Registration Failed ❌', {
        description: 'An unexpected error occurred. Please try again.',
      });
      soundEffects.error();
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = (() => {
    if (!formData.password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (formData.password.length >= 6) score++;
    if (formData.password.length >= 10) score++;
    if (/[A-Z]/.test(formData.password)) score++;
    if (/[0-9]/.test(formData.password)) score++;
    if (/[^A-Za-z0-9]/.test(formData.password)) score++;

    if (score <= 2) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 4) return { level: 3, label: 'Good', color: 'bg-emerald-500' };
    return { level: 4, label: 'Strong', color: 'bg-emerald-600' };
  })();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-80 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-teal-100/50 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle, #059669 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-lg px-4 py-8">
        <Card className="border-0 shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <School className="size-5" />
              </div>
              <h1 className="text-xl font-bold">Skoolar</h1>
            </div>
            <CardTitle className="text-2xl font-bold">✨ Create Account</CardTitle>
            <CardDescription>
              Register your school on the Skoolar platform using a registration code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registration Code */}
              <div className="space-y-2">
                <Label htmlFor="registration-code" className="flex items-center gap-1.5">
                  🔑 Registration Code
                </Label>
                <Input
                  id="registration-code"
                  type="text"
                  placeholder="Enter your school registration code"
                  value={formData.registrationCode}
                  onChange={(e) => handleChange('registrationCode', e.target.value)}
                  className={`h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors ${errors.registrationCode ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
                  required
                  disabled={isLoading}
                />
                <p className="text-[11px] text-gray-500">
                  Enter the registration code provided by your school administrator to create your account.
                </p>
                {errors.registrationCode && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.registrationCode}</p>}
              </div>

              {/* School Name */}
              <div className="space-y-2">
                <Label htmlFor="school-name" className="flex items-center gap-1.5">
                  🏫 School Name
                </Label>
                <Input
                  id="school-name"
                  type="text"
                  placeholder="e.g. Greenfield Academy"
                  value={formData.schoolName}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  className={`h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors ${errors.schoolName ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
                  required
                  disabled={isLoading}
                />
                <p className="text-[11px] text-gray-500">
                  Enter the official name of your school.
                </p>
                {errors.schoolName && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.schoolName}</p>}
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors ${errors.name ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
                    required
                    disabled={isLoading}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@school.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors ${errors.email ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
                    required
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors ${errors.password ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-500">Password strength: {passwordStrength.label}</p>
                  </div>
                )}
                {errors.password && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className={`pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-colors ${errors.confirmPassword ? 'border-red-300 focus-visible:ring-red-200' : ''}`}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="size-3" />{errors.confirmPassword}</p>}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="size-3" />Passwords match</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-600/20 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="size-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <Separator />

            <Button
              type="button"
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-700"
              onClick={onSwitchToLogin}
            >
              <ArrowLeft className="size-4 mr-2" />
              Already have an account? Sign in
            </Button>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Skoolar Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
