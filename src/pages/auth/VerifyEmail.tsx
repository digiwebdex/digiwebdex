import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/lib/i18n';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

type VerificationStatus = 'loading' | 'success' | 'error' | 'pending';

export default function VerifyEmail() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const basePath = language === 'en' ? '/en' : '/bn';

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const handleVerification = async () => {
      // Check for token in URL (from Supabase email link)
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (token_hash && type === 'email') {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email',
          });

          if (error) {
            console.error('Verification error:', error);
            setStatus('error');
            return;
          }

          setStatus('success');
          toast.success(
            language === 'bn' ? 'ইমেইল যাচাই সম্পন্ন!' : 'Email verified!',
            {
              description: language === 'bn'
                ? 'আপনার অ্যাকাউন্ট সক্রিয় হয়েছে।'
                : 'Your account has been activated.',
            }
          );

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate(`${basePath}/dashboard`);
          }, 3000);
        } catch (err) {
          console.error('Verification exception:', err);
          setStatus('error');
        }
      } else {
        // No token, check if user just registered and is waiting for verification
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setEmail(session.user.email ?? null);
          if (session.user.email_confirmed_at) {
            setStatus('success');
          } else {
            setStatus('pending');
          }
        } else {
          setStatus('pending');
        }
      }
    };

    handleVerification();
  }, [searchParams, basePath, navigate, language]);

  const resendVerificationEmail = async () => {
    if (!email) {
      toast.error(
        language === 'bn' ? 'ইমেইল পাওয়া যায়নি' : 'Email not found'
      );
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}${basePath}/auth/verify-email`,
        },
      });

      if (error) {
        toast.error(
          language === 'bn' ? 'ইমেইল পাঠাতে ব্যর্থ' : 'Failed to resend email',
          { description: error.message }
        );
        return;
      }

      toast.success(
        language === 'bn' ? 'ইমেইল পাঠানো হয়েছে!' : 'Email sent!',
        {
          description: language === 'bn'
            ? 'যাচাইকরণ ইমেইল পুনরায় পাঠানো হয়েছে।'
            : 'Verification email has been resent.',
        }
      );
    } catch (err) {
      toast.error(
        language === 'bn' ? 'অপ্রত্যাশিত ত্রুটি' : 'Unexpected error'
      );
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}
              </CardTitle>
              <CardDescription>
                {language === 'bn'
                  ? 'অনুগ্রহ করে অপেক্ষা করুন।'
                  : 'Please wait while we verify your email.'}
              </CardDescription>
            </CardHeader>
          </>
        );

      case 'success':
        return (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                {language === 'bn' ? 'ইমেইল যাচাই সম্পন্ন!' : 'Email Verified!'}
              </CardTitle>
              <CardDescription className="text-base">
                {language === 'bn'
                  ? 'আপনার অ্যাকাউন্ট সফলভাবে সক্রিয় হয়েছে।'
                  : 'Your account has been successfully activated.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'bn'
                  ? 'আপনি স্বয়ংক্রিয়ভাবে ড্যাশবোর্ডে পুনঃনির্দেশিত হবেন।'
                  : 'You will be automatically redirected to the dashboard.'}
              </p>
              <Button asChild className="gradient-button">
                <Link to={`${basePath}/dashboard`}>
                  {language === 'bn' ? 'ড্যাশবোর্ডে যান' : 'Go to Dashboard'}
                </Link>
              </Button>
            </CardContent>
          </>
        );

      case 'error':
        return (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold text-destructive">
                {language === 'bn' ? 'যাচাই ব্যর্থ' : 'Verification Failed'}
              </CardTitle>
              <CardDescription className="text-base">
                {language === 'bn'
                  ? 'এই লিংকটি মেয়াদোত্তীর্ণ বা অবৈধ হতে পারে।'
                  : 'This link may have expired or is invalid.'}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-4">
              <Button asChild variant="outline" className="w-full">
                <Link to={`${basePath}/auth/login`}>
                  {language === 'bn' ? 'লগইন পেজে যান' : 'Go to Login'}
                </Link>
              </Button>
            </CardFooter>
          </>
        );

      case 'pending':
        return (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {language === 'bn' ? 'আপনার ইমেইল যাচাই করুন' : 'Verify Your Email'}
              </CardTitle>
              <CardDescription className="text-base">
                {language === 'bn'
                  ? 'আপনার ইমেইলে পাঠানো লিংকে ক্লিক করুন।'
                  : 'Click the link sent to your email to verify your account.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                {language === 'bn'
                  ? 'ইমেইল না পেলে স্প্যাম ফোল্ডার চেক করুন।'
                  : "Didn't receive the email? Check your spam folder."}
              </p>
              {email && (
                <Button variant="outline" onClick={resendVerificationEmail} className="w-full">
                  {language === 'bn' ? 'ইমেইল পুনরায় পাঠান' : 'Resend Verification Email'}
                </Button>
              )}
            </CardContent>
            <CardFooter className="justify-center">
              <Link
                to={`${basePath}/auth/login`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {language === 'bn' ? 'লগইনে ফিরুন' : 'Back to Login'}
              </Link>
            </CardFooter>
          </>
        );
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md glass-card">
          {renderContent()}
        </Card>
      </div>
    </Layout>
  );
}
