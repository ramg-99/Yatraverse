import { useState, lazy, Suspense } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, Shield, ArrowRight } from 'lucide-react';
import { loginSchema } from '@/schemas/auth.js';
import { login, loginDemo } from '@/services/auth.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label } from '@/components/ui/input.jsx';
import { ConstellationBg } from '@/components/layout/ConstellationBg.jsx';

const Globe = lazy(() => import('@/components/map/Globe.jsx').then((m) => ({ default: m.Globe })));

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demo@yatraverse.app', password: 'demo1234' },
  });

  const onSubmit = async (values) => {
    try {
      await login(values.email, values.password);
      toast.success('Logged in successfully. Welcome back!');
      nav(loc.state?.from || '/dashboard');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleTravellerDemo = async () => {
    try {
      await loginDemo();
      toast.success('Signed in as Demo Traveller (Aarav Mehta).');
      nav('/dashboard');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-ink text-parchment grid lg:grid-cols-2">
      <ConstellationBg />

      {/* Left Column: 3D Globe & Platform Showcase */}
      <div className="relative z-10 hidden items-center justify-center p-12 lg:flex flex-col text-center">
        <Suspense fallback={<div className="h-[300px] w-[300px] rounded-full bg-white/5 animate-pulse" />}>
          <Globe />
        </Suspense>
        <div className="mt-8 max-w-md">
          <span className="font-mono text-xs uppercase tracking-widest text-aurora">
            Yatraverse
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-parchment">
            Plan Multi-City Trips Effortlessly
          </h2>
          <p className="mt-2 text-xs text-muted leading-relaxed">
            Construct day-wise itineraries, track budgets across currencies, explore worldwide cities & activities, and optimize routes with GenAI.
          </p>
        </div>
      </div>

      {/* Right Column: Login Card */}
      <div className="relative z-10 flex items-center justify-center p-6 sm:p-12">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="glass w-full max-w-md rounded-3xl p-8 border border-border/50 shadow-2xl space-y-5"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-saffron">
                Authentication
              </span>
              <Link to="/dashboard" className="text-xs text-muted hover:text-parchment">
                Skip to Dashboard →
              </Link>
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold text-parchment">Sign In to Your Account</h1>
            <p className="mt-1 text-xs text-muted">
              Enter your credentials to access your personal travel itineraries.
            </p>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-saffron hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
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
            <LogIn className="mr-2 h-4 w-4" /> Sign In
          </Button>

          {/* Quick 1-Click Demo Evaluation Buttons */}
          <div className="pt-2 border-t border-border/30 space-y-2">
            <p className="text-[11px] text-muted text-center font-mono uppercase tracking-wider">
              1-Click Evaluation Access
            </p>
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs border-saffron/40 text-saffron hover:bg-saffron/10"
                onClick={handleTravellerDemo}
              >
                👤 Sign in as Demo Traveller (Aarav Mehta)
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-muted pt-2">
            Don't have an account?{' '}
            <Link to="/signup" className="text-saffron font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
