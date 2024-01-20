import { FirebaseError } from 'firebase-admin';
import { Job } from '../../../shared/src/types/job';
import { getUserAndProfile } from './user.util';

export const getJobWithBusiness = async (job: GenericDocument<Job>) => {
  return await getUserAndProfile(job.data().businessId)
    .then((business) => {
      const { businessId, ...jobData } = job.data();
      return {
        id: job.id,
        business,
        ...jobData
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
        return await getJobWithBusiness(job as GenericDocument<Job>)
          .then((jobData) => jobData)
          .catch(() => null);
      })
    )
  ).filter((job: any) => job !== null && typeof job.message === 'undefined');
};
