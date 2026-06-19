'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff } from 'lucide-react';
import Toast from '@/components/ui/Toast';

interface FormErrors {
  [key: string]: string;
}

export default function LoginForm({
  isLoading,
  setIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!forgotPasswordMode && !formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      setToast({ type: 'success', message: 'Signed in successfully!' });
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Login failed';
      setToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    setIsLoading(true);
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${appUrl}/auth/reset-password`,
      });

      if (error) throw error;

      setToast({
        type: 'success',
        message: 'Check your email for password reset link',
      });
      setForgotPasswordMode(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Password reset failed';
      setToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={forgotPasswordMode ? handleForgotPassword : handleLogin}
      className="space-y-4"
    >
      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Email Address
        </label>
        <input
          type="email"
          placeholder="jane@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={errors.email ? 'border-error' : ''}
        />
        {errors.email && (
          <p className="text-error text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      {!forgotPasswordMode && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={`pr-10 ${errors.password ? 'border-error' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-error text-sm mt-1">{errors.password}</p>
          )}
        </div>
      )}

      {/* Forgot Password Link */}
      {!forgotPasswordMode && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setForgotPasswordMode(true)}
            className="text-secondary text-sm hover:text-secondary/80 transition-colors"
          >
            Forgot password?
          </button>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary mt-6"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {forgotPasswordMode ? 'Sending reset link...' : 'Signing in...'}
          </span>
        ) : forgotPasswordMode ? (
          'Send Reset Link →'
        ) : (
          'Sign In →'
        )}
      </button>

      {/* Back to Login */}
      {forgotPasswordMode && (
        <button
          type="button"
          onClick={() => setForgotPasswordMode(false)}
          className="btn-secondary"
        >
          Back to Sign In
        </button>
      )}

      {toast && (
        <Toast
          type={toast.type as 'success' | 'error'}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </form>
  );
}
