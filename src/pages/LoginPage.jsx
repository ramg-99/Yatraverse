import { useState, lazy, Suspense } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { loginSchema } from '@/schemas/auth.js';
import { login, loginDemo } from '@/services/auth.js';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label } from '@/components/ui/input.jsx';
import { ConstellationBg } from '@/components/layout/ConstellationBg.jsx';
import { useTranslation } from 'react-i18next';

const Globe = lazy(() => import('@/components/map/Globe.jsx').then((m) => ({ default: m.Globe })));

export default function LoginPage() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const form = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    try {
      await login(values.email, values.password);
      toast.success('Passport scanned. Welcome back.');
      nav(loc.state?.from || '/dashboard');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const demo = async () => {
    try {
      await loginDemo();
      toast.success('Demo Traveller boarded.');
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
          <p className="font-mono text-xs uppercase tracking-widest text-aurora">{t('tagline')}</p>
          <h1 className="mt-2 font-display text-4xl">{t('auth.login')}</h1>
          <div className="mt-6">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register('email')} />
            {form.formState.errors.email ? <p className="text-xs text-coral">{form.formState.errors.email.message}</p> : null}
          </div>
          <div className="mt-4">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={show ? 'text' : 'password'} {...form.register('password')} />
              <button type="button" className="absolute right-3 top-3" aria-label="Toggle password" onClick={() => setShow((s) => !s)}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password ? (
              <p className="text-xs text-coral">{form.formState.errors.password.message}</p>
            ) : null}
          </div>
          <Button className="mt-6 w-full" type="submit" disabled={form.formState.isSubmitting}>
            Board
          </Button>
          <Button className="mt-3 w-full" variant="outline" type="button" onClick={demo}>
            {t('auth.demo')}
          </Button>
          <p className="mt-4 text-sm text-muted">
            <Link to="/forgot-password" className="text-saffron">
              Forgot password
            </Link>
            {' · '}
            <Link to="/signup" className="text-aurora">
              New passport
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
