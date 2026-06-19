'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';
import Spinner from '@/components/ui/Spinner';

interface ProfileSummaryProps {
  userId: string;
}

export default function ProfileSummary({ userId }: ProfileSummaryProps) {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, supabase]);

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-error text-sm">{error}</p>;
  if (!profile) return <p className="text-text-muted text-sm">No profile found</p>;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Full Name</p>
        <p className="text-text-primary font-medium">{profile.full_name}</p>
      </div>
      <div>
        <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Job Preference</p>
        <p className="text-text-primary font-medium">{profile.job_preference}</p>
      </div>
      <div>
        <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Location</p>
        <p className="text-text-primary font-medium">{profile.location}</p>
      </div>
      {profile.profile_summary && (
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide mb-1">AI Summary</p>
          <p className="text-text-primary text-sm leading-relaxed">
            {profile.profile_summary}
          </p>
        </div>
      )}
    </div>
  );
}
