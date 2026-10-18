import { useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { signupSchema } from '@/schemas/auth.js';
import { signup } from '@/services/auth.js';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label } from '@/components/ui/input.jsx';
import { ConstellationBg } from '@/components/layout/ConstellationBg.jsx';

const Globe = lazy(() => import('@/components/map/Globe.jsx').then((m) => ({ default: m.Globe })));

export default function SignupPage() {
  const [show, setShow] = useState(false);
  const nav = useNavigate();
  const form = useForm({ resolver: zodResolver(signupSchema), defaultValues: { name: '', email: '', password: '' } });

  const onSubmit = async (values) => {
    try {
      await signup(values);
      toast.success('Passport stamped. The atlas is yours.');
      nav('/dashboard');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <ConstellationBg />
      <div className="relative z-10 hidden items-center justify-center md:flex">
        <Suspense fallback={null}>
          <Globe />
        </Suspense>
      </div>
      <div className="relative z-10 flex items-center justify-center p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="glass w-full max-w-md rounded-3xl p-8">
          <h1 className="font-display text-4xl">Stamp a passport</h1>
          <div className="mt-6">
            <Label>Name</Label>
            <Input {...form.register('name')} />
            {form.formState.errors.name ? <p className="text-xs text-coral">{form.formState.errors.name.message}</p> : null}
          </div>
          <div className="mt-4">
            <Label>Email</Label>
            <Input type="email" {...form.register('email')} />
            {form.formState.errors.email ? <p className="text-xs text-coral">{form.formState.errors.email.message}</p> : null}
          </div>
          <div className="mt-4">
            <Label>Password</Label>
            <div className="relative">
              <Input type={show ? 'text' : 'password'} {...form.register('password')} />
              <button type="button" className="absolute right-3 top-3" aria-label="Toggle password" onClick={() => setShow((s) => !s)}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password ? (
              <p className="text-xs text-coral">{form.formState.errors.password.message}</p>
            ) : null}
          </div>
          <Button className="mt-6 w-full" type="submit">
            Create traveller
          </Button>
          <Link to="/login" className="mt-4 block text-sm text-saffron">
            Already boarded?
          </Link>
        </form>
      </div>
    </div>
  );
}
