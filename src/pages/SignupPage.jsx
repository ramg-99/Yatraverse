import { useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import { signupSchema } from '@/schemas/auth.js';
import { signup } from '@/services/auth.js';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label } from '@/components/ui/input.jsx';
import { ConstellationBg } from '@/components/layout/ConstellationBg.jsx';

const Globe = lazy(() => import('@/components/map/Globe.jsx').then((m) => ({ default: m.Globe })));

export default function SignupPage() {
  const [show, setShow] = useState(false);
  const nav = useNavigate();
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (values) => {
    try {
      await signup(values);
      toast.success('Account created successfully! Welcome to Yatraverse.');
      nav('/dashboard');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-ink text-parchment grid lg:grid-cols-2">
      <ConstellationBg />
      <div className="relative z-10 hidden items-center justify-center p-12 lg:flex flex-col text-center">
        <Suspense fallback={<div className="h-[300px] w-[300px] rounded-full bg-white/5 animate-pulse" />}>
          <Globe />
        </Suspense>
        <div className="mt-8 max-w-md">
          <span className="font-mono text-xs uppercase tracking-widest text-aurora">
            Yatraverse
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-parchment">
            Start Your Journey Today
          </h2>
          <p className="mt-2 text-xs text-muted leading-relaxed">
            Create your account to start mapping multi-city trips, collaborating with fellow travelers, and organizing budgets.
          </p>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center p-6 sm:p-12">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="glass w-full max-w-md rounded-3xl p-8 border border-border/50 shadow-2xl space-y-5"
        >
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-saffron">
              Supabase Registration
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-parchment">Create Your Account</h1>
            <p className="mt-1 text-xs text-muted">
              Sign up securely with Supabase to start planning personalized trips.
            </p>
          </div>

          {/* Google OAuth One-Tap Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-border/70 hover:bg-white/5 flex items-center justify-center gap-2.5 h-11"
            onClick={async () => {
              try {
                const { loginWithGoogle } = await import('@/services/auth.js');
                await loginWithGoogle();
              } catch (e) {
                toast.error(e.message || 'Google registration failed.');
              }
            }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Sign up with Google
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border/40 w-full" />
            <span className="bg-ink px-2 text-[10px] font-mono uppercase text-muted tracking-widest">or email</span>
            <div className="border-t border-border/40 w-full" />
          </div>


          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Aarav Mehta"
              {...form.register('name')}
              className="mt-1.5"
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-xs text-coral">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...form.register('email')}
              className="mt-1.5"
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-coral">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={show ? 'text' : 'password'}
                placeholder="At least 6 characters"
                {...form.register('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-parchment"
                onClick={() => setShow((s) => !s)}
                aria-label="Toggle password visibility"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="mt-1 text-xs text-coral">{form.formState.errors.password.message}</p>
            )}
          </div>

          <Button className="w-full" size="lg" type="submit" disabled={form.formState.isSubmitting}>
            <UserPlus className="mr-2 h-4 w-4" /> Create Account
          </Button>

          <p className="text-center text-xs text-muted pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-saffron font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
