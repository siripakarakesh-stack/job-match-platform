'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { triggerN8NWorkflow } from '@/lib/n8n';
import CVUploader from '@/components/dashboard/CVUploader';
import Toast from '@/components/ui/Toast';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasExistingCV, setHasExistingCV] = useState(false);
  const [existingMatches, setExistingMatches] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/auth');
        return;
      }

      setUserId(session.user.id);

      // Check if user has existing CV and matches
      const { data: profile } = await supabase
        .from('profiles')
        .select('cv_url')
        .eq('id', session.user.id)
        .single();

      if (profile?.cv_url) {
        setHasExistingCV(true);
      }

      const { data: matches } = await supabase
        .from('matched_jobs')
        .select('id')
        .eq('user_id', session.user.id);

      if (matches) {
        setExistingMatches(matches.length);
      }
    };

    checkAuth();
  }, [supabase, router]);

  const handleCVUpload = useCallback(
    async (file: File) => {
      if (!userId) {
        setToast({ type: 'error', message: 'User not authenticated' });
        return;
      }

      setIsLoading(true);
      try {
        // Upload to Supabase Storage
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `cvs/${userId}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('cvs')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get signed URL
        const { data: signedUrlData } = await supabase.storage
          .from('cvs')
          .createSignedUrl(filePath, 3600 * 24 * 7); // 7 days

        if (!signedUrlData?.signedUrl) {
          throw new Error('Failed to create signed URL');
        }

        // Update profile with CV URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ cv_url: signedUrlData.signedUrl })
          .eq('id', userId);

        if (updateError) throw updateError;

        // Get profile data for n8n
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!profile) throw new Error('Profile not found');

        // Trigger n8n workflow
        await triggerN8NWorkflow({
          user_id: userId,
          cv_url: signedUrlData.signedUrl,
          full_name: profile.full_name,
          job_preference: profile.job_preference,
          location: profile.location,
        });

        setToast({
          type: 'success',
          message: 'CV uploaded successfully! Analyzing your profile...',
        });

        // Poll for matches
        let pollCount = 0;
        const maxPolls = 20; // 60 seconds max
        const pollInterval = setInterval(async () => {
          const { data: matches, count } = await supabase
            .from('matched_jobs')
            .select('id')
            .eq('user_id', userId);

          if (matches && matches.length > 0) {
            clearInterval(pollInterval);
            setExistingMatches(matches.length);
            // Redirect to jobs page
            setTimeout(() => {
              router.push('/dashboard/jobs');
            }, 1000);
          }

          pollCount++;
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            setToast({
              type: 'info',
              message: 'CV processed. Matches will appear shortly.',
            });
          }
        }, 3000);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Upload failed';
        setToast({ type: 'error', message });
      } finally {
        setIsLoading(false);
      }
    },
    [userId, supabase, router]
  );

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-text-primary font-heading mb-3">
          Upload Your CV
        </h1>
        <p className="text-lg text-text-muted">
          We'll analyze your experience and match you with the best opportunities.
        </p>
      </div>

      {/* Existing CV Banner */}
      {hasExistingCV && existingMatches > 0 && (
        <div className="mb-8 p-4 bg-success/10 border border-success/30 rounded-card">
          <p className="text-success font-medium">
            ✓ You already have {existingMatches} job match
            {existingMatches !== 1 ? 'es' : ''} —{' '}
            <a href="/dashboard/jobs" className="underline hover:no-underline">
              view them below
            </a>
          </p>
        </div>
      )}

      {/* CV Uploader */}
      {userId && <CVUploader onUpload={handleCVUpload} isLoading={isLoading} />}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type as 'success' | 'error' | 'info'}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
