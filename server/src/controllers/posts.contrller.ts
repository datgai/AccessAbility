import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Post } from '../../../shared/src/types/post';
import { UserRole } from '../../../shared/src/types/user';
import { postsRef } from '../database';
import { getError, saveImage, upload } from '../services/uploader.service';
import { getMissingParameters } from '../utils/param.util';

export const getPosts = async (request: Request, response: Response) => {
  const posts = await postsRef.get();

  return response
    .status(StatusCodes.OK)
    .json(posts.docs.map((post) => ({ id: post.id, ...post.data() })));
};

export const createPost = async (request: Request, response: Response) => {
  const user = request.user;

  upload.single('thumbnail')(request, response, async (err) => {
    const error = getError(err);
    if (error !== null) {
      return response.status(error.status).json({ message: error.message });
    }

    type Body = Pick<Post, 'title' | 'content' | 'isDonation'>;
    const body = request.body as Body;

    const missingParams = getMissingParameters<keyof Body>(request, [
      'title',
      'content',
      'isDonation'
    ]);

    if (
      user.profile.role !== UserRole.ADMIN &&
      missingParams.includes('isDonation')
    ) {
      missingParams.splice(missingParams.indexOf('isDonation'), 1);
    }

    if (missingParams.length > 0) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        messsage: 'Missing parameters.',
        missing: missingParams
      });
    }

    const baseUrl = `${request.protocol}://${request.get('host')}`;
    const thumbnail = request.file!;
    const buffer = thumbnail.buffer;
    const originalName = thumbnail.originalname;

    saveImage(
      baseUrl,
      'thumbnails',
      buffer,
      originalName,
      async (error, url) => {
        if (error) {
          return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: `Something went wrong processing the file: ${error.message}`
          });
        }

        body.isDonation =
          user.profile.role === UserRole.ADMIN ? body.isDonation : false;

        const postDetails: Post = {
          authorId: user.uid,
          title: body.title,
          content: body.content,
          comments: [],
          thumbnailUrl: url,
          isDonation: body.isDonation ?? false
        };

        return await postsRef
          .add(postDetails)
          .then(async (post) => {
            const postData = await post.get();
            return response.status(StatusCodes.CREATED).json({
              id: postData.id,
              ...postData.data()
            });
          })
          .catch((error) => {
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
              message: 'Something went wrong saving the post.',
              error
            });
          });
      }
    );
  });
};

export const deletePostById = async (request: Request, response: Response) => {
  const id = request.params.id ?? '';

  return await postsRef
    .doc(id)
    .get()
    .then(async (post) => {
      if (!post.exists) {
        return response.status(StatusCodes.NOT_FOUND).json({
          message: 'Post you are trying to delete cannot be found.'
        });
      }

      return await post.ref
        .delete()
        .then(() => {
          return response.status(StatusCodes.NO_CONTENT).json({
            message: 'Post successfully deleted.'
          });
        })
        .catch((err) => {
          return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Something went wrong while trying to delete the post.',
            error: err
          });
        });
    })
    .catch((err) => {
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong while trying to delete the post.',
        error: err
      });
    });
};
