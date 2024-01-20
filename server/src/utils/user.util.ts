import { UserProfile } from '../../../shared/src/types/user';
import { profilesRef } from '../database';

export const getProfileById = async (userId: string) => {
  const profile = await profilesRef.doc(userId).get();
  return (profile.exists ? profile.data() ?? {} : {}) as UserProfile;
};
