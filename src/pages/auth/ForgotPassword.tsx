import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/lib/i18n';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const { language } = useLanguage();
  const basePath = language === 'en' ? '/en' : '/bn';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${basePath}/auth/reset-password`,
      });

      if (error) {
        toast.error(
          language === 'bn' ? 'ত্রুটি হয়েছে' : 'An error occurred',
          { description: error.message }
        );
        setLoading(false);
        return;
      }

      setEmailSent(true);
      toast.success(
        language === 'bn' ? 'ইমেইল পাঠানো হয়েছে' : 'Email sent',
        {
          description: language === 'bn'
            ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।'
            : 'Password reset link has been sent to your email.',
        }
      );
    } catch (err) {
      toast.error(
        language === 'bn' ? 'অপ্রত্যাশিত ত্রুটি' : 'Unexpected error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md glass-card">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {language === 'bn' ? 'ইমেইল পাঠানো হয়েছে!' : 'Check your email!'}
              </CardTitle>
              <CardDescription className="text-base">
                {language === 'bn'
                  ? `আমরা ${email} এ একটি পাসওয়ার্ড রিসেট লিংক পাঠিয়েছি।`
                  : `We've sent a password reset link to ${email}.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                {language === 'bn'
                  ? 'ইমেইল না পেলে স্প্যাম ফোল্ডার চেক করুন।'
                  : "Didn't receive the email? Check your spam folder."}
              </p>
              <Button
                variant="outline"
                onClick={() => setEmailSent(false)}
                className="w-full"
              >
                {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try again'}
              </Button>
            </CardContent>
            <CardFooter className="justify-center">
              <Link
                to={`${basePath}/auth/login`}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                {language === 'bn' ? 'লগইনে ফিরুন' : 'Back to login'}
              </Link>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              {language === 'bn' ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset Password'}
            </CardTitle>
            <CardDescription>
              {language === 'bn'
                ? 'আপনার ইমেইল দিন, আমরা রিসেট লিংক পাঠাব।'
                : "Enter your email and we'll send you a reset link."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {language === 'bn' ? 'ইমেইল' : 'Email'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full gradient-button" disabled={loading}>
                {loading
                  ? (language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...')
                  : (language === 'bn' ? 'রিসেট লিংক পাঠান' : 'Send Reset Link')}
              </Button>
              <Link
                to={`${basePath}/auth/login`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                {language === 'bn' ? 'লগইনে ফিরুন' : 'Back to login'}
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
