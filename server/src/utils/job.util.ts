import { FirebaseError } from 'firebase-admin';
import { Job } from '../../../shared/src/types/job';
import { formatSkills } from './skills.util';
import { getUserAndProfile } from './user.util';

export const getJobWithUsers = async (job: GenericDocument<Job>) => {
  return await getUserAndProfile(job.data().businessId)
    .then(async (business) => {
      const { businessId, skills, applicants, ...jobData } = job.data();

      const populatedApplicants = await Promise.all(
        applicants.map(
          async (applicantId) => await getUserAndProfile(applicantId)
        )
      );

      return {
        id: job.id,
        business,
        ...jobData,
        skills: await formatSkills(skills),
        applicants: populatedApplicants
      };
    })
    .catch((error: FirebaseError) => {
      if (error.code === 'auth/user-not-found') {
        return {
          message: 'Could not find business that created this job listing.',
          job: {
            id: job.id,
            ...job.data()
          }
        };
      }
      throw error;
    });
};

export const formatJobsList = async (jobs: GenericDocument<Job>[]) => {
  return (
    await Promise.all(
      jobs.map(async (job) => {
        return await getJobWithUsers(job as GenericDocument<Job>)
          .then((jobData) => jobData)
          .catch(() => null);
      })
    )
  ).filter((job: any) => job !== null && typeof job.message === 'undefined');
};
