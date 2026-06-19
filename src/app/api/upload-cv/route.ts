import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { triggerN8NWorkflow } from '@/lib/n8n';

export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `cvs/${session.user.id}/${fileName}`;

    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError, data } = await supabase.storage
      .from('cvs')
      .upload(filePath, new Uint8Array(fileBuffer));

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 400 }
      );
    }

    // Get signed URL
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('cvs')
      .createSignedUrl(filePath, 3600 * 24 * 7); // 7 days

    if (urlError || !signedUrlData?.signedUrl) {
      return NextResponse.json(
        { error: 'Failed to create signed URL' },
        { status: 400 }
      );
    }

    // Update profile with CV URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ cv_url: signedUrlData.signedUrl })
      .eq('id', session.user.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Trigger n8n workflow
    try {
      await triggerN8NWorkflow({
        user_id: session.user.id,
        cv_url: signedUrlData.signedUrl,
        full_name: profile.full_name,
        job_preference: profile.job_preference,
        location: profile.location,
      });
    } catch (n8nError) {
      console.error('n8n workflow error:', n8nError);
      // Don't fail the upload if n8n fails, just log it
    }

    return NextResponse.json({
      success: true,
      cv_url: signedUrlData.signedUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
