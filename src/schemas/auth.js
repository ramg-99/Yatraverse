import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Use a real email so we can find your passport.'),
  password: z.string().min(6, 'At least 6 characters.'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Tell us who is travelling.'),
  email: z.string().email('That does not look like an email.'),
  password: z.string().min(8, 'Make it 8+ characters.'),
});

export const forgotSchema = z.object({
  email: z.string().email('We need a valid email to pretend we sent mail.'),
});

export const tripSchema = z.object({
  name: z.string().min(3, 'Name the constellation.'),
  description: z.string().max(400).optional(),
  start_date: z.string().min(1, 'Pick a start date.'),
  end_date: z.string().min(1, 'Pick an end date.'),
  cover_url: z.string().optional(),
}).refine((d) => d.end_date >= d.start_date, { message: 'End date must follow start.', path: ['end_date'] });

export const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});
