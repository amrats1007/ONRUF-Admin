import { Router, Request, Response } from 'express';
import { prisma } from '../common/prisma.js';

export const usersRouter = Router();

usersRouter.get('/', async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, createdAt: true } });
  res.json(users);
});
