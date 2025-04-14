import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from './email.service';

export class AuthService {
  private redis: Redis;
  private userRepository: Repository<User>;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
    this.userRepository = AppDataSource.getRepository(User);
  }

  async register(userData: {
    universityId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { universityId: userData.universityId },
        { email: userData.email }
      ]
    });

    if (existingUser) {
      throw new Error('User with this university ID or email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(userData.password);

    // Create new user
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role: 'student' // Default role
    });

    await this.userRepository.save(user);

    // Generate token
    const token = this.generateToken(user);

    // Save session
    await this.saveSession(user.id, token);

    return { user, token };
  }

  async login(universityId: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findOne({
      where: { universityId }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await this.validatePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    await this.saveSession(user.id, token);

    return { user, token };
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not
      return;
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.redis.set(
      `reset:${resetToken}`,
      user.id,
      'EX',
      3600 // 1 hour
    );

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const userId = await this.redis.get(`reset:${token}`);
    if (!userId) {
      throw new Error('Invalid or expired reset token');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    // Delete reset token
    await this.redis.del(`reset:${token}`);
  }

  async logout(userId: string, token: string): Promise<void> {
    await this.redis.del(`session:${userId}`);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(user: User): string {
    return jwt.sign(
      { 
        id: user.id,
        role: user.role,
        universityId: user.universityId
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  async saveSession(userId: string, token: string): Promise<void> {
    await this.redis.set(
      `session:${userId}`,
      token,
      'EX',
      60 * 60 * 24 * 7 // 7 days
    );
  }

  async validateSession(userId: string, token: string): Promise<boolean> {
    const savedToken = await this.redis.get(`session:${userId}`);
    return savedToken === token;
  }

  async verifyToken(token: string): Promise<{ id: string; role: string; universityId: string }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        role: string;
        universityId: string;
      };
      
      // Verify session is still valid
      const isValidSession = await this.validateSession(decoded.id, token);
      if (!isValidSession) {
        throw new Error('Session expired');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
} 