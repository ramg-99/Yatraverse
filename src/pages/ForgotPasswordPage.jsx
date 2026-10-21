import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { forgotSchema } from '@/schemas/auth.js';
import { forgotPassword } from '@/services/auth.js';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label } from '@/components/ui/input.jsx';
import { ConstellationBg } from '@/components/layout/ConstellationBg.jsx';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const form = useForm({ resolver: zodResolver(forgotSchema), defaultValues: { email: '' } });

  const onSubmit = async (values) => {
    try {
      await forgotPassword(values.email);
      setSent(true);
      toast.success('Password reset instructions sent to your email.');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6 bg-ink text-parchment">
      <ConstellationBg />
      <div className="glass relative z-10 w-full max-w-md rounded-3xl p-8 border border-border/50 shadow-2xl space-y-5">
        {sent ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-aurora" />
            <h1 className="font-display text-2xl font-bold text-parchment">Reset Email Sent</h1>
            <p className="text-xs text-muted leading-relaxed">
              If an account is associated with that email address, we have sent instructions to reset your password.
            </p>
            <div className="pt-2">
              <Link to="/login">
                <Button className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-muted hover:text-parchment">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <span className="font-mono text-xs uppercase tracking-widest text-saffron">
                  Password Recovery
                </span>
              </div>
              <h1 className="mt-2 font-display text-2xl font-bold text-parchment">Reset Password</h1>
              <p className="mt-1 text-xs text-muted">
                Enter your registered email address to receive password reset instructions.
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

            <Button className="w-full" size="lg" type="submit" disabled={form.formState.isSubmitting}>
              <KeyRound className="mr-2 h-4 w-4" /> Send Reset Instructions
            </Button>

            <p className="text-center text-xs text-muted pt-2">
              Remember your password?{' '}
              <Link to="/login" className="text-saffron font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
