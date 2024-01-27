import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Transaction } from  '../../../shared/src/types/transaction';
import { transactionRef } from '../database';

export const createTransaction = async (request: Request, response: Response) => {
    const user = request.user;
    const itemId = request.params.id ?? '';

    const transactionDetails:Transaction = {
        userId: user.uid,
        itemId: itemId
      };
      return await transactionRef
      .add(transactionDetails)
      .then(async (chat) => {
        const chatData = await chat.get();
        return response.status(StatusCodes.CREATED).json({
          id: chatData.id,
          ...chatData.data()
        });
      })
      .catch((error) => {
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'Something went wrong creating the transaction.',
          error
        });
      });
}

export const getTransactions = async (request: Request, response: Response) => {
    const user = request.user;
    const userId = request.params.id ?? '';

    let transactions;
    transactions = await transactionRef
    .where('userId', '==',userId)
    .get();

    const docs = transactions.docs as GenericDocument<Transaction>[];

    return response.status(StatusCodes.OK).json(
        transactions.docs.map((transaction) => ({ id: transaction.id, ...transaction.data()})));
}