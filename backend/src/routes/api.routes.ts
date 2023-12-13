import { Response, Router } from 'express';
import { firebase } from '../firebase';

const router = Router();

router.get('/auth/test', async (_, res: Response) => {
  const user = await firebase
    .auth()
    .getUserByEmail('williamlaw.3001@gmail.com');
  res.status(200).json({ message: 'testing authentication', user });
});

export default router;
