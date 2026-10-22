import { useState, lazy, Suspense } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, Shield, ArrowRight, Phone, Mail } from 'lucide-react';
import { loginSchema } from '@/schemas/auth.js';
import { login, loginDemo, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp } from '@/services/auth.js';
import { useAuthStore } from '@/store/useAuthStore.js';

import { Button } from '@/components/ui/button.jsx';
import { Input, Label } from '@/components/ui/input.jsx';
import { ConstellationBg } from '@/components/layout/ConstellationBg.jsx';

const Globe = lazy(() => import('@/components/map/Globe.jsx').then((m) => ({ default: m.Globe })));

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [phoneMode, setPhoneMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const nav = useNavigate();
  const loc = useLocation();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demo@yatraverse.app', password: 'demo1234' },
  });

  const onSubmit = async (values) => {
    try {
      await login(values.email, values.password);
      toast.success('Logged in successfully with Supabase!');
      nav(loc.state?.from || '/dashboard');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      toast.error(e.message || 'Google login failed. Ensure Google provider is enabled in Supabase.');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return toast.error('Enter a valid phone number with country code (e.g. +91...)');
    setOtpLoading(true);
    try {
      await sendPhoneOtp(phoneNumber);
      setOtpSent(true);
      toast.success(`OTP sent to ${phoneNumber}`);
    } catch (err) {
      toast.error(err.message || 'Phone OTP failed. Ensure Phone provider is active in Supabase.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) return toast.error('Enter the OTP code received');
    setOtpLoading(true);
    try {
      await verifyPhoneOtp(phoneNumber, otpCode);
      toast.success('Signed in via Phone OTP!');
      nav(loc.state?.from || '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid verification code.');
    } finally {
      setOtpLoading(false);
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
        <div className="glass w-full max-w-md rounded-3xl p-8 border border-border/50 shadow-2xl space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-saffron">
                Supabase Auth
              </span>
              <Link to="/dashboard" className="text-xs text-muted hover:text-parchment">
                Skip to Dashboard →
              </Link>
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold text-parchment">
              {phoneMode ? 'Sign in with Phone' : 'Sign in to Yatraverse'}
            </h1>
            <p className="mt-1 text-xs text-muted">
              {phoneMode
                ? 'Enter your phone number to receive a secure SMS OTP code.'
                : 'Access your cloud-synced travel itineraries and AI recommendations.'}
            </p>
          </div>

          {/* Google OAuth One-Tap Button */}
          {!phoneMode && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full border-border/70 hover:bg-white/5 flex items-center justify-center gap-2.5 h-11"
                onClick={handleGoogleLogin}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </Button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-border/40 w-full" />
                <span className="bg-ink px-2 text-[10px] font-mono uppercase text-muted tracking-widest">or email</span>
                <div className="border-t border-border/40 w-full" />
              </div>
            </>
          )}

          {/* Phone SMS OTP Mode */}
          {phoneMode ? (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone Number (with country code)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mt-1.5"
                    />
                    <p className="mt-1 text-[11px] text-muted">Include country code (e.g. +91 for India, +1 for USA)</p>
                  </div>
                  <Button className="w-full" size="lg" type="submit" disabled={otpLoading}>
                    <Phone className="mr-2 h-4 w-4" /> {otpLoading ? 'Sending SMS…' : 'Send Verification OTP'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <Label htmlFor="otp">Enter 6-Digit OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="mt-1.5 text-center tracking-widest text-lg font-mono"
                      maxLength={6}
                    />
                    <p className="mt-1 text-[11px] text-muted text-center">SMS sent to {phoneNumber}</p>
                  </div>
                  <Button className="w-full" size="lg" type="submit" disabled={otpLoading}>
                    {otpLoading ? 'Verifying…' : 'Confirm & Sign In'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-full text-center text-xs text-saffron hover:underline"
                  >
                    Change Phone Number
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Email + Password Form */
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            </form>
          )}

          {/* Toggle Phone / Email button */}
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => { setPhoneMode(!phoneMode); setOtpSent(false); }}
              className="text-xs text-aurora hover:underline flex items-center gap-1.5 font-medium"
            >
              {phoneMode ? <Mail className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
              {phoneMode ? 'Switch to Email & Password' : 'Sign in with Phone SMS / OTP'}
            </button>
          </div>

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
        </div>
      </div>

    </div>
  );
}
