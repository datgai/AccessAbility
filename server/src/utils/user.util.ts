import { UserProfile } from '../../../shared/src/types/user';
import { profilesRef } from '../database';
import { auth } from '../firebase';

export const getProfileById = async (userId: string) => {
  const profile = await profilesRef.doc(userId).get();
  return (profile.exists ? profile.data() ?? {} : {}) as UserProfile;
};

export const getUserAndProfile = async (userId: string) => {
  return await auth.getUser(userId).then(async (business) => {
    const profile = await getProfileById(business.uid);
    return { ...business, profile };
  });
};
