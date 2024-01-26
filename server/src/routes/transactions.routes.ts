import { Router } from 'express';
import { createTransaction, getTransactions } from '../controllers/transactions.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

router.get('/transactions', getTransactions); //get transactions of current user
router.post('/transact', isAuthenticated, createTransaction); //create transaction

export default router;
