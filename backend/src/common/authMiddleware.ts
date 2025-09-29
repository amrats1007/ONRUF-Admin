import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export interface AuthRequest extends Request {
  user?: { id: string; roles: string[]; permissions?: string[] };
}

async function resolvePermissions(userId: string): Promise<string[]> {
  const roles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { include: { rolePerms: { include: { permission: true } } } } }
  });
  const set = new Set<string>();
  for (const ur of roles) {
    for (const rp of ur.role.rolePerms) {
      set.add(rp.permission.code);
    }
  }
  return Array.from(set);
}

export function requireAuth(requiredRoles?: string[], requiredPerms?: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'missing bearer token' });
    const token = auth.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
      if (!user) return res.status(401).json({ error: 'user not found' });
      const roles = decoded.roles || [];
      let permissions: string[] | undefined = undefined;
      if (requiredPerms && requiredPerms.length > 0) {
        permissions = await resolvePermissions(user.id);
        if (!requiredPerms.every(p => permissions!.includes(p))) {
          return res.status(403).json({ error: 'missing-permission', required: requiredPerms });
        }
      }
      req.user = { id: user.id, roles, permissions };
      if (requiredRoles && !requiredRoles.some(r => roles.includes(r))) {
        return res.status(403).json({ error: 'forbidden' });
      }
      next();
    } catch {
      return res.status(401).json({ error: 'invalid token' });
    }
  };
}

export function requirePermission(permission: string) {
  return requireAuth(undefined, [permission]);
}
