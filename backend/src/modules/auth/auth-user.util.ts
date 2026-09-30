import { Request } from 'express';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity.js';

export interface RequestUser {
  id: string;
  name: string;
  email: string;
  role: 'FREELANCER' | 'CLIENT' | 'ADMIN';
  companyName?: string;
  avatarUrl?: string;
}

export async function extractUserFromRequest(
  req: Request,
  userRepo?: Repository<User>,
): Promise<RequestUser | null> {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || typeof authHeader !== 'string') return null;

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  // Expected token pattern: fh_jwt_<userId>_<timestamp>
  if (!token.startsWith('fh_jwt_')) return null;

  const parts = token.slice('fh_jwt_'.length);
  const lastUnderscore = parts.lastIndexOf('_');
  const userId = lastUnderscore !== -1 ? parts.slice(0, lastUnderscore) : parts;

  if (!userId) return null;

  if (userRepo) {
    try {
      const user = await userRepo.findOne({ where: { id: userId } });
      if (user) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyName: user.companyName,
          avatarUrl: user.avatarUrl,
        };
      }
    } catch {
      // Fallback if DB lookup fails
    }
  }

  return {
    id: userId,
    name: 'Authenticated User',
    email: 'user@lancenexa.dev',
    role: 'CLIENT',
  };
}
