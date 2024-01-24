import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Response } from 'express';
import helmet from 'helmet';
import path from 'path';
import { cacheControl } from './middleware/cache.middleware';
import authRoute from './routes/auth.routes';
import jobsRoute from './routes/jobs.routes';
import postsRoute from './routes/posts.routes';
import resourcesRoute from './routes/resources.routes';
import skillsRoute from './routes/skills.routes';
import testRoute from './routes/test.routes';
import usersRoute from './routes/users.routes';
import { UPLOADS_FOLDER } from './services/uploader.service';

// Load environment variables
dotenv.config();

// Create app
const app = express();

// Express middleware
app.use(
  cors({
    origin: process.env
      .CORS!.split('|')
      .map((domain) =>
        domain.startsWith('http') ? domain : `http://${domain}`
      )
  })
);
app.use(helmet());
app.use(express.json());
app.use(cacheControl({ cacheDays: 3 }));

// Register routes
app.use('/test', testRoute);
app.use('/api', authRoute);
app.use('/api', usersRoute);
app.use('/api', postsRoute);
app.use('/api', jobsRoute);
app.use('/api', skillsRoute);
app.use('/api', resourcesRoute);

// Serve static files
app.use(
  '/uploads',
  (_, response: Response, next: NextFunction) => {
    response.set('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.resolve(__dirname, '..', UPLOADS_FOLDER))
);

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Started listening to server on port ${process.env.PORT}.`);
});
