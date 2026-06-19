import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              console.error('Cookie setting error:', error);
            }
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch matched jobs
    const { data: matchedJobs, error: matchError } = await supabase
      .from('matched_jobs')
      .select(
        `
        id,
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
          description,
          created_at
        )
      `
      )
      .eq('user_id', session.user.id)
      .order('match_score', { ascending: false });

    if (matchError) {
      return NextResponse.json(
        { error: matchError.message },
        { status: 400 }
      );
    }

    // Format response
    const jobs = matchedJobs?.map((match: any) => ({
      ...match.jobs,
      match_score: match.match_score,
      matched_at: match.matched_at,
    })) || [];

    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
