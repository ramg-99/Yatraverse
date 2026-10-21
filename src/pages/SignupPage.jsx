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
              Registration
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-parchment">Create Your Account</h1>
            <p className="mt-1 text-xs text-muted">
              Fill in your details to start planning personalized trips.
            </p>
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
