import { z } from 'zod';

export const CreateProjectSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  requiredSkills: z.array(z.string())
    .min(1, 'At least one skill is required'),
  timeline: z.object({
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
  }).refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  }),
  maxMembers: z.number().min(1, 'Must have at least 1 member').max(10, 'Maximum 10 members allowed'),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED']).default('OPEN')
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>; 