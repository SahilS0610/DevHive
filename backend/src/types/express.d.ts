import { User } from '../entities/User';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      role: string;
      universityId: string;
    };
  }
} 