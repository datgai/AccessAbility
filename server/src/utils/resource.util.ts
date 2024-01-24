import { firestore } from 'firebase-admin';
import type { Resource } from '../../../shared/src/types/resource';
import { getUserAndProfile } from './user.util';

export const populateResource = async (resource: GenericDocument<Resource>) => {
  const { authorId, price, createdAt, ...resourceData } = resource.data();
  const author = await getUserAndProfile(authorId);

  return {
    author,
    ...resourceData,
    price: price / 100,
    createdAt: (createdAt as unknown as firestore.Timestamp).toDate()
  };
};
