import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/lib/i18n';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const basePath = language === 'en' ? '/en' : '/bn';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // User must have a session from the password reset email
      if (session) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
      }
    };

    // Listen for auth state changes (when user clicks reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsValidSession(true);
        }
      }
    );

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) {
      errors.push(language === 'bn' ? 'কমপক্ষে ৮ অক্ষর' : 'At least 8 characters');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push(language === 'bn' ? 'একটি বড় হাতের অক্ষর' : 'One uppercase letter');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push(language === 'bn' ? 'একটি ছোট হাতের অক্ষর' : 'One lowercase letter');
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push(language === 'bn' ? 'একটি সংখ্যা' : 'One number');
    }
    return errors;
  };

  const passwordErrors = validatePassword(password);
  const isPasswordValid = passwordErrors.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error(
        language === 'bn' ? 'পাসওয়ার্ড দুর্বল' : 'Password is too weak',
        { description: passwordErrors.join(', ') }
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error(
        language === 'bn' ? 'পাসওয়ার্ড মিলছে না' : 'Passwords do not match'
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(
          language === 'bn' ? 'পাসওয়ার্ড আপডেট ব্যর্থ' : 'Password update failed',
          { description: error.message }
        );
        setLoading(false);
        return;
      }

      toast.success(
        language === 'bn' ? 'পাসওয়ার্ড আপডেট হয়েছে!' : 'Password updated!',
        {
          description: language === 'bn'
            ? 'আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।'
            : 'Your password has been changed successfully.',
        }
      );

      // Sign out and redirect to login
      await supabase.auth.signOut();
      navigate(`${basePath}/auth/login`);
    } catch (err) {
      toast.error(
        language === 'bn' ? 'অপ্রত্যাশিত ত্রুটি' : 'Unexpected error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (isValidSession === null) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // Invalid session state
  if (!isValidSession) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md glass-card">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {language === 'bn' ? 'অবৈধ লিংক' : 'Invalid Link'}
              </CardTitle>
              <CardDescription className="text-base">
                {language === 'bn'
                  ? 'এই পাসওয়ার্ড রিসেট লিংকটি মেয়াদোত্তীর্ণ বা অবৈধ।'
                  : 'This password reset link has expired or is invalid.'}
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Link
                to={`${basePath}/auth/forgot-password`}
                className="text-primary hover:underline"
              >
                {language === 'bn' ? 'নতুন লিংক অনুরোধ করুন' : 'Request a new link'}
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
              {language === 'bn' ? 'নতুন পাসওয়ার্ড সেট করুন' : 'Set New Password'}
            </CardTitle>
            <CardDescription>
              {language === 'bn'
                ? 'আপনার নতুন পাসওয়ার্ড দিন।'
                : 'Enter your new password below.'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  {language === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password strength indicators */}
                {password && (
                  <div className="space-y-1 mt-2">
                    {[
                      { check: password.length >= 8, text: language === 'bn' ? 'কমপক্ষে ৮ অক্ষর' : 'At least 8 characters' },
                      { check: /[A-Z]/.test(password), text: language === 'bn' ? 'একটি বড় হাতের অক্ষর' : 'One uppercase letter' },
                      { check: /[a-z]/.test(password), text: language === 'bn' ? 'একটি ছোট হাতের অক্ষর' : 'One lowercase letter' },
                      { check: /[0-9]/.test(password), text: language === 'bn' ? 'একটি সংখ্যা' : 'One number' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <CheckCircle className={`h-3 w-3 ${item.check ? 'text-green-500' : 'text-muted-foreground'}`} />
                        <span className={item.check ? 'text-green-600' : 'text-muted-foreground'}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive">
                    {language === 'bn' ? 'পাসওয়ার্ড মিলছে না' : 'Passwords do not match'}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full gradient-button" 
                disabled={loading || !isPasswordValid || password !== confirmPassword}
              >
                {loading
                  ? (language === 'bn' ? 'আপডেট হচ্ছে...' : 'Updating...')
                  : (language === 'bn' ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Password')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
