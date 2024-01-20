import { firestore } from 'firebase-admin';
import { UserProfile } from '../../../shared/src/types/user';
import { profilesRef } from '../database';
import { auth } from '../firebase';

export const getProfileById = async (userId: string) => {
  const profile = (await profilesRef
    .doc(userId)
    .get()) as GenericDocument<UserProfile>;

  const { dateOfBirth, ...profileData } = profile.data();
  if (!dateOfBirth) return {} as UserProfile;

  return (
    profile.exists
      ? {
          ...profileData,
          dateOfBirth: (dateOfBirth as unknown as firestore.Timestamp).toDate()
        } ?? {}
      : {}
  ) as UserProfile;
};

export const getUserAndProfile = async (userId: string) => {
  return await auth.getUser(userId).then(async (user) => {
    const profile = await getProfileById(user.uid);

    return {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      profile
    };
  });
};
