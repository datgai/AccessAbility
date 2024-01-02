import { UserProfile } from '../../shared/src/types/user';
import { database } from './firebase';

export const profilesRef = database.collection('profiles');

export const getProfileById = async (userId: string) => {
  const profile = await profilesRef.doc(userId).get();
  return (profile.exists ? profile.data() ?? {} : {}) as UserProfile;
};

export const jobsRef = database.collection('jobs');
export const skillsRef = database.collection('skills');
