import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { prisma } from '../common/prisma.js';
import { User, Role, UserRole } from '@prisma/client';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const ACCESS_TTL_S = 60 * 15; // 15 min
const REFRESH_TTL_S = 60 * 60 * 24 * 7; // 7 days

function signAccessToken(userId: string, roles: string[]) {
  return jwt.sign({ sub: userId, roles }, JWT_SECRET, { expiresIn: ACCESS_TTL_S });
}
function hash(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function issueRefreshToken(userId: string) {
  const raw = crypto.randomBytes(40).toString('hex');
  const tokenHash = hash(raw);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_S * 1000);
  await prisma.refreshToken.create({ data: { tokenHash, userId, expiresAt } });
  return { raw, expiresAt };
}

export async function registerHandler(req: Request, res: Response) {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'email in use' });
  const hash = await argon2.hash(password);
  const user = await prisma.user.create({ data: { email, passwordHash: hash, name } });
  res.status(201).json({ id: user.id, email: user.email });
}

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  const user = await prisma.user.findUnique({
    where: { email: email || '' },
    include: { userRoles: { include: { role: true } } }
  }) as (User & { userRoles: (UserRole & { role: Role })[] }) | null;
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) return res.status(401).json({ error: 'invalid credentials' });
  const roles = user.userRoles.map((ur) => ur.role.name);
  const access = signAccessToken(user.id, roles);
  const { raw: refresh, expiresAt } = await issueRefreshToken(user.id);
  res.json({ access, refresh, expiresIn: ACCESS_TTL_S, refreshExpiresAt: expiresAt, roles });
}

export async function refreshHandler(req: Request, res: Response) {
  const { refresh } = req.body as { refresh?: string };
  if (!refresh) return res.status(400).json({ error: 'refresh token required' });
  const tokenHash = hash(refresh);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: { include: { userRoles: { include: { role: true } } } } } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    return res.status(401).json({ error: 'invalid refresh token' });
  }
  // rotate
  const roles = stored.user.userRoles.map(ur => ur.role.name);
  const access = signAccessToken(stored.userId, roles);
  const { raw: newRefresh, expiresAt } = await issueRefreshToken(stored.userId);
  await prisma.refreshToken.update({ where: { tokenHash }, data: { revokedAt: new Date() } });
  res.json({ access, expiresIn: ACCESS_TTL_S, refresh: newRefresh, refreshExpiresAt: expiresAt, roles });
}
