'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Upload,
  Briefcase,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import ProfileSummary from './ProfileSummary';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        // Fetch profile
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (data) {
          setProfile(data);
        }
      }
      setIsLoading(false);
    };

    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const navItems = [
    {
      label: 'Upload CV',
      icon: Upload,
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      label: 'Matched Jobs',
      icon: Briefcase,
      href: '/dashboard/jobs',
      active: pathname === '/dashboard/jobs',
    },
  ];

  if (isLoading) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 lg:hidden z-50 p-2 hover:bg-surface rounded-input transition-colors"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-60 bg-surface border-r border-surface-border flex flex-col transition-transform duration-300 z-40 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-8 border-b border-surface-border">
          <h2 className="text-2xl font-bold shimmer-text font-heading">CareerAI</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-input transition-all duration-200 ${
                  item.active
                    ? 'bg-primary/15 text-primary border-l-2 border-primary'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile Section */}
        <div className="border-t border-surface-border p-6 space-y-4">
          {/* Profile Button */}
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-input hover:bg-surface/50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-primary text-sm">
                {profile?.full_name
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-text-muted truncate">{profile?.email}</p>
            </div>
            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${
                isProfileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="bg-surface/50 border border-surface-border rounded-card p-4 space-y-4">
              <ProfileSummary userId={user.id} />
            </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
