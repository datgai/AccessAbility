import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { chatsRef } from '../database';
import { Chat, Message } from '../../../shared/src/types/chat';
import { firestore } from 'firebase-admin';

export const getChatById = async (request: Request, response: Response) => {
  const id = request.params.id ?? '';

  let chats;
    chats = await chatsRef
    .doc(id)
    .get()
    .then(async (chat) => {
      if (!chat.exists) {
        return response.status(StatusCodes.NOT_FOUND).json({
          message: 'Chat you are looking for cannot be found.'
        });
      }

      const postDoc = chat as GenericDocument<Chat>;
      return response.status(StatusCodes.OK).json( chat.data() );
    })
    .catch((err) => {
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong while trying to find the job.',
        error: err
      });
    });
};

export const createChat = async (request: Request, response: Response) => {
  const user = request.user;
  const otherUser = request.body;

  const chatDetails:Chat = {
    lastMessage: 'Created',
    lastMessageDate:firestore.Timestamp.fromDate(new Date()).toDate(),
    userIds: [user?.uid, otherUser?.uid],
    users:[
      {
        displayName: user?.profile.firstName ?? '',
        photoURL : user?.profile.profilePictureUrl ?? '',
      },
      {
        displayName: otherUser?.profile.firstName ?? '',
        photoURL : otherUser?.profile.profilePictureUrl ?? '',
      }
    ]
  };

  return await chatsRef
      .add(chatDetails)
      .then(async (chat) => {
        const chatData = await chat.get();
        return response.status(StatusCodes.CREATED).json({
          id: chatData.id,
          ...chatData.data()
        });
      })
      .catch((error) => {
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'Something went wrong creating the chat.',
          error
        });
      });
  };

export const sendMessage  = async (request: Request, response: Response) => {
  const user = request.user.uid;
  const message = request.body.content;
  const id = request.params.id ?? '';

  const messageDetails:Message = {
    text: message,
    senderId: user,
    sentDate : firestore.Timestamp.fromDate(new Date()).toDate()
  };

  return await chatsRef
      .doc(id)
      .collection('message')
      .add(messageDetails)
      .then(async (chat) => {
        const chatData = await chat.get();
        return response.status(StatusCodes.CREATED).json({
          id: chatData.id,
          ...chatData.data()
        });
      })
      .catch((error) => {
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'Something went wrong sending the message.',
          error
        });
      });
  };