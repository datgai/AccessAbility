import { Request, Response } from 'express';
import { firestore } from 'firebase-admin';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import { Comment, Post } from '../../../shared/src/types/post';
import { UserRole } from '../../../shared/src/types/user';
import { postsRef } from '../database';
import { getError, saveImage, upload } from '../services/uploader.service';
import { getMissingParameters } from '../utils/param.util';
import { formatPost } from '../utils/post.util';

export const getPosts = async (request: Request, response: Response) => {
  const token = request.params.token ?? ' ';

  const posts = await postsRef
    .orderBy(firestore.FieldPath.documentId())
    .startAfter(token)
    .limit(10)
    .get();
  const docs = posts.docs as GenericDocument<Post>[];

  return response.status(StatusCodes.OK).json({
    posts: await Promise.all(docs.map(async (post) => await formatPost(post))),
    nextPageToken: docs.length === 10 ? docs.at(-1)?.id : undefined
  });
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

    let thumbnailUrl: string = '';
    if (request.file) {
      const baseUrl = `${request.protocol}://${request.get('host')}`;
      const thumbnail = request.file!;
      const buffer = thumbnail.buffer;
      const originalName = thumbnail.originalname;

      try {
        thumbnailUrl = await saveImage(
          baseUrl,
          path.join('thumbnails', 'posts'),
          buffer,
          originalName
        );
      } catch (error: any) {
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: `Something went wrong processing the file: ${error.message}`
        });
      }
    }

    body.isDonation =
      user.profile.role === UserRole.ADMIN ? body.isDonation : false;

    const postDetails: Post = {
      authorId: user.uid,
      title: body.title,
      content: body.content,
      comments: [],
      thumbnailUrl: thumbnailUrl,
      isDonation: body.isDonation ?? false,
      createdAt: new Date()
    };

    return await postsRef
      .add({
        ...postDetails,
        createdAt: firestore.Timestamp.fromDate(postDetails.createdAt)
      })
      .then(async (post) => {
        const postData = (await post.get()) as GenericDocument<Post>;
        const { authorId, createdAt, ...data } = postData.data();

        return response.status(StatusCodes.CREATED).json({
          id: postData.id,
          author: user,
          createdAt: (createdAt as unknown as firestore.Timestamp).toDate(),
          ...data
        });
      })
      .catch((error) => {
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'Something went wrong saving the post.',
          error
        });
      });
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

      const user = request.user;
      if ((post.data() as Post).authorId !== user.uid) {
        return response.status(StatusCodes.FORBIDDEN).json({
          message:
            'You are not allowed to delete a post that you did not create.'
        });
      }

      return await post.ref
        .delete()
        .then(() => {
          return response.status(StatusCodes.OK).json({
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

export const getPostById = async (request: Request, response: Response) => {
  const id = request.params.id ?? '';

  return await postsRef
    .doc(id)
    .get()
    .then(async (post) => {
      if (!post.exists) {
        return response.status(StatusCodes.NOT_FOUND).json({
          message: 'Post you are looking for cannot be found.'
        });
      }

      const postDoc = post as GenericDocument<Post>;
      return response.status(StatusCodes.OK).json(await formatPost(postDoc));
    })
    .catch((err) => {
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong while trying to find the job.',
        error: err
      });
    });
};

export const addComment = async (request: Request, response: Response) => {
  const content = request.body.content as string | undefined;
  if (!content) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      message: 'No content provided for comment.'
    });
  }

  const user = request.user;
  const id = request.params.id ?? '';

  const comment: Comment = {
    authorId: user.uid,
    content,
    createdAt: new Date()
  };

  return await postsRef
    .doc(id)
    .get()
    .then(async (post) => {
      if (!post.exists) {
        return response.status(StatusCodes.NOT_FOUND).json({
          message: 'Post you are trying to comment on cannot be found.'
        });
      }

      const postDoc = post as GenericDocument<Post>;

      return await postsRef
        .doc(id)
        .set({
          ...postDoc.data(),
          comments: [
            {
              ...comment,
              createdAt: firestore.Timestamp.fromDate(comment.createdAt)
            },
            ...postDoc.data().comments
          ]
        })
        .then(() => {
          return response.status(StatusCodes.OK).json({
            message: 'Successfully added comment.'
          });
        })
        .catch(() => {
          return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Something went wrong adding comment.'
          });
        });
    });
};
