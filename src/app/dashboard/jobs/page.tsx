'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MatchedJob } from '@/types';
import JobsList from '@/components/dashboard/JobsList';
import Toast from '@/components/ui/Toast';
import { Filter, ArrowDownUp } from 'lucide-react';

export default function JobsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<MatchedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'remote' | 'location' | 'role'>('all');
  const [sortBy, setSortBy] = useState<'match' | 'newest'>('match');

  useEffect(() => {
    const fetchJobs = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/auth');
        return;
      }

      setUserId(session.user.id);

      try {
        const { data, error } = await supabase
          .from('matched_jobs')
          .select(
            `
            id,
            user_id,
            job_id,
            match_score,
            matched_at,
            jobs (
              job_id,
              company,
              role,
              apply_link,
              location,
              tags,
              description
            )
          `
          )
          .eq('user_id', session.user.id)
          .order('match_score', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedJobs = data.map((match: any) => ({
            ...match.jobs,
            match_score: match.match_score,
            matched_at: match.matched_at,
          }));
          setJobs(formattedJobs);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setToast({
          type: 'error',
          message: 'Failed to load matched jobs',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [supabase, router]);

  const handleGenerateCV = async (jobId: string) => {
    try {
      const response = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_id: jobId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate CV');
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cv-${jobId.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-5xl font-bold text-text-primary font-heading mb-2">
              Your Matches
            </h1>
            <p className="text-lg text-text-muted">
              <span className="text-secondary font-semibold">{jobs.length}</span> jobs
              matched to your profile
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'remote', label: 'Remote' },
                { key: 'location', label: 'Your Location' },
                { key: 'role', label: 'By Role' },
              ] as const
            ).map((option) => (
              <button
                key={option.key}
                onClick={() => setFilter(option.key)}
                className={`px-4 py-2 rounded-pill font-medium transition-all duration-200 ${
                  filter === option.key
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-surface-border text-text-muted hover:text-text-primary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'match' | 'newest')}
            className="px-4 py-2 bg-surface border border-surface-border rounded-input text-text-primary text-sm"
          >
            <option value="match">Best Match</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      <JobsList
        isLoading={isLoading}
        jobs={jobs}
        onGenerateCV={handleGenerateCV}
        filter={filter}
        sortBy={sortBy}
      />

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type as 'success' | 'error'}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
