'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import Toast from '@/components/ui/Toast';

interface FormErrors {
  [key: string]: string;
}

export default function RegisterForm({
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    job_preference: '',
    location: '',
    password: '',
    confirm_password: '',
  });

  const passwordStrength = (
    password: string
  ): { strength: 'weak' | 'medium' | 'strong'; color: string } => {
    if (password.length < 8) return { strength: 'weak', color: 'bg-error' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 'strong', color: 'bg-success' };
    }
    return { strength: 'medium', color: 'bg-secondary' };
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.job_preference) newErrors.job_preference = 'Job preference is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: authData.user.id,
          full_name: formData.full_name,
          email: formData.email,
          job_preference: formData.job_preference,
          location: formData.location,
        },
      ]);

      if (profileError) throw profileError;

      setToast({
        type: 'success',
        message: 'Account created! Please check your email to confirm.',
      });

      setTimeout(() => {
        router.push('/auth');
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setToast({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  };

  const strength = passwordStrength(formData.password);
  const passwordsMatch =
    formData.confirm_password &&
    formData.password === formData.confirm_password;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Full Name
        </label>
        <input
          type="text"
          placeholder="Jane Doe"
          value={formData.full_name}
          onChange={(e) =>
            setFormData({ ...formData, full_name: e.target.value })
          }
          className={errors.full_name ? 'border-error' : ''}
        />
        {errors.full_name && (
          <p className="text-error text-sm mt-1">{errors.full_name}</p>
        )}
      </div>

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

      {/* Job Preference */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Job Preference
        </label>
        <select
          value={formData.job_preference}
          onChange={(e) =>
            setFormData({ ...formData, job_preference: e.target.value })
          }
          className={errors.job_preference ? 'border-error' : ''}
        >
          <option value="">Select a preference</option>
          <option value="Software Engineer">Software Engineer</option>
          <option value="Product Manager">Product Manager</option>
          <option value="Data Scientist">Data Scientist</option>
          <option value="Designer">Designer</option>
          <option value="Marketing">Marketing</option>
          <option value="DevOps">DevOps</option>
          <option value="Sales">Sales</option>
          <option value="Other">Other</option>
        </select>
        {errors.job_preference && (
          <p className="text-error text-sm mt-1">{errors.job_preference}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Location
        </label>
        <input
          type="text"
          placeholder="Berlin, Germany"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          className={errors.location ? 'border-error' : ''}
        />
        {errors.location && (
          <p className="text-error text-sm mt-1">{errors.location}</p>
        )}
      </div>

      {/* Password */}
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
            className={errors.password ? 'border-error pr-10' : 'pr-10'}
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
        {formData.password && (
          <div className="mt-2">
            <div className="flex items-center gap-2 text-sm mb-1">
              <div className={`h-1 flex-1 rounded-full ${strength.color}`}></div>
              <span className="text-text-muted text-xs capitalize">
                {strength.strength}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.confirm_password}
            onChange={(e) =>
              setFormData({ ...formData, confirm_password: e.target.value })
            }
            className={`pr-10 ${
              formData.confirm_password
                ? passwordsMatch
                  ? ''
                  : 'border-error'
                : ''
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {formData.confirm_password && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {passwordsMatch ? (
                <Check size={18} className="text-success" />
              ) : (
                <X size={18} className="text-error" />
              )}
            </div>
          )}
        </div>
        {errors.confirm_password && (
          <p className="text-error text-sm mt-1">{errors.confirm_password}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary mt-6"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Creating account...
          </span>
        ) : (
          'Create Account →'
        )}
      </button>

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
