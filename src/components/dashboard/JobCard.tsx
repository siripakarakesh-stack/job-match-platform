'use client';

import { MatchedJob } from '@/types';
import Badge from '@/components/ui/Badge';
import { Download, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import Toast from '@/components/ui/Toast';

interface JobCardProps {
  job: MatchedJob;
  onGenerateCV: (jobId: string) => Promise<void>;
  index?: number;
}

export default function JobCard({
  job,
  onGenerateCV,
  index = 0,
}: JobCardProps) {
  const [isGeneratingCV, setIsGeneratingCV] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const handleGenerateCV = async () => {
    setIsGeneratingCV(true);
    try {
      await onGenerateCV(job.job_id);
      setToast({
        type: 'success',
        message: 'CV generated and downloaded!',
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to generate CV',
      });
    } finally {
      setIsGeneratingCV(false);
    }
  };

  const handleApply = () => {
    window.open(job.apply_link, '_blank');
  };

  return (
    <div
      className="card card-shimmer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      style={{
        animation: `slideInUp 0.5s ease ${index * 0.08}s both`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-text-muted font-medium">{job.company}</p>
          <h3 className="text-xl font-bold text-text-primary font-heading">
            {job.role}
          </h3>
          <p className="text-xs text-text-muted font-mono mt-1">
            #{job.job_id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        {/* Match Score Circle */}
        <div className="flex-shrink-0">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg
              className="w-20 h-20 transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(99, 102, 241, 0.1)"
                strokeWidth="3"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#22D3EE"
                strokeWidth="3"
                strokeDasharray={`${2.827 * job.match_score} 282.7`}
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute text-2xl font-bold text-secondary">
              {job.match_score}%
            </span>
          </div>
        </div>
      </div>

      {/* Location and Tags */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="secondary" size="sm">
          📍 {job.location}
        </Badge>
        {job.tags &&
          job.tags.slice(0, 2).map((tag, idx) => (
            <Badge key={idx} variant="primary" size="sm">
              {tag}
            </Badge>
          ))}
      </div>

      {/* Description */}
      {job.description && (
        <p className="text-sm text-text-muted leading-relaxed mb-4 line-clamp-2">
          {job.description}
        </p>
      )}

      {/* Match Date */}
      <p className="text-xs text-text-muted mb-4">
        Matched {new Date(job.matched_at).toLocaleDateString()}
      </p>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-surface-border">
        <button
          onClick={handleApply}
          className="btn-secondary flex-1 flex items-center justify-center gap-2"
        >
          <ExternalLink size={16} />
          Apply
        </button>
        <button
          onClick={handleGenerateCV}
          disabled={isGeneratingCV}
          className="btn-secondary flex-1 flex items-center justify-center gap-2"
        >
          {isGeneratingCV ? (
            <>
              <div className="w-3 h-3 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
              Generating...
            </>
          ) : (
            <>
              <Download size={16} />
              Download CV
            </>
          )}
        </button>
      </div>

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
