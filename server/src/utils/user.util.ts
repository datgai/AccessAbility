import { firestore } from 'firebase-admin';
import { Skill } from '../../../shared/src/types/job';
import { UserProfile } from '../../../shared/src/types/user';
import { profilesRef, skillsRef } from '../database';
import { auth } from '../firebase';

export const getProfileById = async (userId: string): Promise<UserProfile> => {
  // Fetch profile
  const profile = (await profilesRef
    .doc(userId)
    .get()) as GenericDocument<UserProfile>;

  // Check if profile exists
  if (!profile.exists) return {} as UserProfile;

  // Extract data that needs to be converted or populated
  const { dateOfBirth, skills, ...profileData } = profile.data();

  // Get the skill name of each skill
  const populatedSkills = await Promise.all(
    skills.map(async (skillId) => {
      const skill = (await skillsRef
        .doc(skillId)
        .get()) as GenericDocument<Skill>;
      return skill.data().name;
    })
  );

  const populatedProfile: UserProfile = {
    ...profileData,
    skills: populatedSkills,
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
