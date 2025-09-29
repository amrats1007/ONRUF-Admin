import { Router } from 'express';
import { loginHandler, refreshHandler, registerHandler } from './service.js';

export const authRouter = Router();

authRouter.post('/register', registerHandler);
authRouter.post('/login', loginHandler);
authRouter.post('/refresh', refreshHandler);
