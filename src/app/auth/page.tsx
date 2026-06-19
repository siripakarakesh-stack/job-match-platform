'use client';

import { useState } from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import LoginForm from '@/components/auth/LoginForm';

export default function AuthPage() {
  const [tab, setTab] = useState<'register' | 'login'>('login');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-surface/50 p-1 rounded-pill">
        <button
          onClick={() => setTab('register')}
          className={`flex-1 py-3 px-4 rounded-[8px] font-semibold transition-all duration-200 ${
            tab === 'register'
              ? 'bg-primary text-white'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Create Account
        </button>
        <button
          onClick={() => setTab('login')}
          className={`flex-1 py-3 px-4 rounded-[8px] font-semibold transition-all duration-200 ${
            tab === 'login'
              ? 'bg-primary text-white'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Sign In
        </button>
      </div>

      {/* Tab Content */}
      <div className="card">
        {tab === 'register' ? (
          <RegisterForm isLoading={isLoading} setIsLoading={setIsLoading} />
        ) : (
          <LoginForm isLoading={isLoading} setIsLoading={setIsLoading} />
        )}
      </div>
    </div>
  );
}
