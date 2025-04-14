import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { validateRegistration, validateLogin } from '../validators/auth.validator';

export class AuthController {
  private authService: AuthService;
  private userService: UserService;

  constructor() {
    this.authService = new AuthService();
    this.userService = new UserService();
  }

  async register(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = validateRegistration(req.body);
      
      // Check if user exists
      const existingUser = await this.userService.findByUniversityId(validatedData.universityId);
      if (existingUser) {
        return res.status(400).json({ error: 'University ID already registered' });
      }

      // Create user
      const hashedPassword = await this.authService.hashPassword(validatedData.password);
      const user = await this.userService.create({
        ...validatedData,
        password: hashedPassword,
        role: 'student' // Default role
      });

      // Generate token
      const token = this.authService.generateToken(user);
      await this.authService.saveSession(user.id, token);

      res.status(201).json({
        token,
        user: {
          id: user.id,
          universityId: user.universityId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Registration failed' });
      }
    }
  }

  async login(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = validateLogin(req.body);
      
      // Find user
      const user = await this.userService.findByUniversityId(validatedData.universityId);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Validate password
      const isValidPassword = await this.authService.validatePassword(
        validatedData.password,
        user.password
      );
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = this.authService.generateToken(user);
      await this.authService.saveSession(user.id, token);

      res.json({
        token,
        user: {
          id: user.id,
          universityId: user.universityId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Login failed' });
      }
    }
  }

  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      // Find user by email
      const user = await this.userService.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({ message: 'If an account exists, a password reset email has been sent' });
      }

      // Generate reset token and send email
      await this.authService.requestPasswordReset(email);

      res.json({ message: 'If an account exists, a password reset email has been sent' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Password reset request failed' });
      }
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      
      // Validate new password
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }

      // Reset password
      await this.authService.resetPassword(token, newPassword);

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Password reset failed' });
      }
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token && req.user) {
        await this.authService.logout(req.user.id, token);
      }
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Logout failed' });
      }
    }
  }
} 