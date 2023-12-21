import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import apiRoute from './routes/api.routes';
import testRoute from './routes/test.routes';

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
app.use('/api', apiRoute);

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Started listening to server on port ${process.env.PORT}.`);
});
