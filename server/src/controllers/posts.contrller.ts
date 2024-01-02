import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { postsRef } from '../database';

export const getPosts = async (request: Request, response: Response) => {
  const posts = await postsRef.get();

  return response
    .status(StatusCodes.OK)
    .json(posts.docs.map((post) => ({ id: post.id, ...post.data() })));
};
