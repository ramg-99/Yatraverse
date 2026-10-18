import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
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
      toast.success('Reset pulse sent (simulated).');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <ConstellationBg />
      <div className="glass relative z-10 w-full max-w-md rounded-3xl p-8">
        {sent ? (
          <>
            <h1 className="font-display text-3xl">Check the night sky</h1>
            <p className="mt-2 text-sm text-muted">If that email holds a passport, a reset trail just left the hangar.</p>
            <Link to="/login" className="mt-6 inline-block text-saffron">
              Back to boarding
            </Link>
          </>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <h1 className="font-display text-3xl">Recover the orbit</h1>
            <Label className="mt-6">Email</Label>
            <Input type="email" {...form.register('email')} />
            {form.formState.errors.email ? <p className="text-xs text-coral">{form.formState.errors.email.message}</p> : null}
            <Button className="mt-6 w-full" type="submit">
              Send reset
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
