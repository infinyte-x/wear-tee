import { useState, useEffect } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional(),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const { user, signIn, signUp } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate({ to: '/' });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = authSchema.safeParse({ email, password, fullName });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Welcome back!' });
        navigate({ to: '/' });
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({
          title: 'Signup failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Account created successfully!' });
        navigate({ to: '/' });
      }
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-12">
            <Link to="/" className="text-[1rem] tracking-[0.15em] uppercase text-[#181818]">
              {settings?.store_name?.toUpperCase() || 'BRAND'}
            </Link>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-[1.25rem] uppercase tracking-[0.1em] font-normal text-[#181818] mb-2">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="text-[0.75rem] text-[#666666]">
              {isLogin ? 'Welcome back' : 'Join us for exclusive access'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#181818]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-[#e5e5e5] bg-transparent text-[0.875rem] text-[#181818] placeholder:text-[#999999] focus:border-[#181818] focus:outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#181818]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#e5e5e5] bg-transparent text-[0.875rem] text-[#181818] placeholder:text-[#999999] focus:border-[#181818] focus:outline-none transition-colors"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-[0.65rem] text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-[0.65rem] tracking-[0.15em] uppercase text-[#181818]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#e5e5e5] bg-transparent text-[0.875rem] text-[#181818] placeholder:text-[#999999] focus:border-[#181818] focus:outline-none transition-colors"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-[0.65rem] text-red-500">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 text-[0.65rem] tracking-[0.2em] uppercase bg-[#181818] hover:bg-[#181818]/90 text-white rounded-none mt-2"
            >
              {submitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#e5e5e5]">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[0.75rem] text-[#666666] hover:text-[#181818] transition-colors"
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="underline underline-offset-4">
                {isLogin ? 'Sign up' : 'Sign in'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Image (Desktop only) */}
      <div className="hidden lg:block w-1/2 bg-neutral-100">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&q=80)',
          }}
        />
      </div>
    </div>
  );
};

export default Auth;
