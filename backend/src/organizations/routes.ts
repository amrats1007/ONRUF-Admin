import { Router, Request, Response } from 'express';
import { prisma } from '../common/prisma.js';
import { requireAuth, requirePermission } from '../common/authMiddleware.js';

export const orgRouter = Router();

// Require either admin role OR permission org.manage
orgRouter.use(requireAuth(['admin'], ['org.manage']));

orgRouter.get('/', async (_req: Request, res: Response) => {
  const orgs = await prisma.organization.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(orgs);
});

orgRouter.post('/', requirePermission('org.manage'), async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const org = await prisma.organization.create({ data: { name } });
  res.status(201).json(org);
});
