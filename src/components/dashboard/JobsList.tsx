'use client';

import { MatchedJob } from '@/types';
import JobCard from './JobCard';
import { useEffect, useState } from 'react';
import Spinner from '@/components/ui/Spinner';
import { Briefcase } from 'lucide-react';

interface JobsListProps {
  isLoading: boolean;
  jobs: MatchedJob[];
  onGenerateCV: (jobId: string) => Promise<void>;
  filter?: 'all' | 'remote' | 'location' | 'role';
  sortBy?: 'match' | 'newest';
}

export default function JobsList({
  isLoading,
  jobs,
  onGenerateCV,
  filter = 'all',
  sortBy = 'match',
}: JobsListProps) {
  const [filteredJobs, setFilteredJobs] = useState<MatchedJob[]>(jobs);

  useEffect(() => {
    let result = [...jobs];

    // Sort
    if (sortBy === 'match') {
      result.sort((a, b) => b.match_score - a.match_score);
    } else if (sortBy === 'newest') {
      result.sort(
        (a, b) =>
          new Date(b.matched_at).getTime() - new Date(a.matched_at).getTime()
      );
    }

    setFilteredJobs(result);
  }, [jobs, filter, sortBy]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse space-y-4">
            <div className="h-4 bg-surface/50 rounded w-3/4"></div>
            <div className="h-6 bg-surface/50 rounded w-full"></div>
            <div className="h-4 bg-surface/50 rounded w-1/2"></div>
            <div className="flex gap-2">
              <div className="h-10 bg-surface/50 rounded flex-1"></div>
              <div className="h-10 bg-surface/50 rounded flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Briefcase size={32} className="text-primary/60" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-text-primary font-heading mb-2">
          No matches yet
        </h3>
        <p className="text-text-muted mb-6">Upload your CV to get started</p>
        <a
          href="/dashboard"
          className="inline-block bg-primary text-white px-6 py-2 rounded-input font-medium hover:bg-primary-dark transition-colors"
        >
          Upload CV
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredJobs.map((job, idx) => (
        <JobCard
          key={job.job_id}
          job={job}
          onGenerateCV={onGenerateCV}
          index={idx}
        />
      ))}
    </div>
  );
}
