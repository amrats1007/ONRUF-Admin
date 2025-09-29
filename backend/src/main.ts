import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
config();

import { authRouter } from './auth/routes.js';
import { usersRouter } from './users/routes.js';
import { orgRouter } from './organizations/routes.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*'}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/organizations', orgRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on :${port}`);
});
