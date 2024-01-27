import { Router } from 'express';
import { createTransaction, getTransactions } from '../controllers/transactions.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

router.get('/transactions/:id', getTransactions); //get transactions of current user id
router.post('/transact/:id', isAuthenticated,createTransaction); //create transaction

export default router;
