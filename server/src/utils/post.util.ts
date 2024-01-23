import { firestore } from 'firebase-admin';
import { Post } from '../../../shared/src/types/post';
import { getUserAndProfile } from './user.util';

export const formatPost = async (post: GenericDocument<Post>) => {
  const { authorId, createdAt, comments, ...postData } = post.data();

  // Fetch data of post author
  return await getUserAndProfile(post.data().authorId).then(async (author) => {
    // Fetch data of each comment's author
    const populatedComments = await Promise.all(
      comments.map(async (comment) => {
        return await getUserAndProfile(comment.authorId).then(
          (commentAuthor) => {
            const { authorId, createdAt, ...strippedComment } = comment;
            return {
              author: commentAuthor,
              ...strippedComment,
              createdAt: (createdAt as unknown as firestore.Timestamp).toDate()
            };
          }
        );
      })
    );

    return {
      id: post.id,
      author,
      ...postData,
      comments: populatedComments,
      createdAt: (createdAt as unknown as firestore.Timestamp).toDate()
    };
  });
};
