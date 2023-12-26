import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import authRoute from './routes/auth.routes';
import testRoute from './routes/test.routes';
import usersRoute from './routes/users.routes';

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

// Register routes
app.use('/test', testRoute);
app.use('/api', authRoute);
app.use('/api', usersRoute);

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Started listening to server on port ${process.env.PORT}.`);
});
