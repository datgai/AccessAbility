import { firestore } from 'firebase-admin';
import type { Resource } from '../../../shared/src/types/resource';
import { getUserAndProfile } from './user.util';

export const populateResource = async (resource: GenericDocument<Resource>) => {
  const { authorId, price, createdAt, ...resourceData } = resource.data();
  const author = await getUserAndProfile(authorId);

  return {
    id: resource.id,
    author,
    ...resourceData,
    price: formatPrice(price),
    createdAt: (createdAt as unknown as firestore.Timestamp).toDate()
  };
};

const formatPrice = (price: number) => {
  return (
    Math.floor((price / 100) * Math.pow(10, 2)) / Math.pow(10, 2)
  ).toFixed(2);
};
