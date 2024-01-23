import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { chatsRef } from '../database';

export const createChat = async (request: Request, response: Response) => {
  const user = request.user;
  const otherUser = request.body;

  console.log(user);
  console.log(otherUser);

  const chatDetails = {
    userIds: [user?.uid, otherUser?.uid],
    users:[
      {
        displayName: user?.profile.firstName ?? '',
        photoURL : user?.profile.profilePictureUrl ?? '',
      },
      {
        displayName: user?.profile.firstName ?? '',
        photoURL : user?.profile.profilePictureUrl ?? '',
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

export const getChats = async (request: Request, response: Response) => {
  const chats = await chatsRef.get();

  return response
    .status(StatusCodes.OK)
    .json(chats.docs.map((chat) => ({ id: chat.id, ...chat.data() })));
};