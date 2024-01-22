import { firestore } from 'firebase-admin';
import { UserProfile } from '../../../shared/src/types/user';
import { profilesRef } from '../database';
import { auth } from '../firebase';
import { formatSkills } from './skills.util';

export const getProfileById = async (userId: string): Promise<UserProfile> => {
  // Fetch profile
  const profile = (await profilesRef
    .doc(userId)
    .get()) as GenericDocument<UserProfile>;

  // Check if profile exists
  if (!profile.exists) return {} as UserProfile;

  // Extract data that needs to be converted or populated
  const { dateOfBirth, skills, ...profileData } = profile.data();

  const populatedProfile: UserProfile = {
    ...profileData,
    skills: await formatSkills(skills),
    dateOfBirth: (dateOfBirth as unknown as firestore.Timestamp).toDate()
  };

  return populatedProfile;
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

export const hasProfile = (profile: UserProfile) => {
  return Object.keys(profile).length !== 0;
};
