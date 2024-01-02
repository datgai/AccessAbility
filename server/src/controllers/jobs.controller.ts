import { Request, Response } from 'express';
import { firestore } from 'firebase-admin';
import { StatusCodes } from 'http-status-codes';
import { Job, JobLocationType, JobType } from '../../../shared/src/types/job';
import { jobsRef } from '../database';
import { getMissingParameters } from '../utils/param.util';

export const createJob = async (request: Request, response: Response) => {
  type Body = Omit<Job, 'businessId' | 'createdAt'>;
  type Parameter = keyof Body;

  const requiredParams: Parameter[] = [
    'description',
    'locationType',
    'position',
    'type'
  ];

  const missingParams = getMissingParameters(request, requiredParams);
  if (missingParams.length > 0) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      message: 'Missing parameters.',
      missing: missingParams
    });
  }

  const user = request.user;
  const body = request.body as Body;

  if (!Object.values(JobType).includes(body.type as JobType)) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      message: 'Unknown job type provided. Job type must be one of JobType.'
    });
  }

  if (
    !Object.values(JobLocationType).includes(
      body.locationType as JobLocationType
    )
  ) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      message:
        'Unknown location type provided. Location type must be one of JobLocationType.'
    });
  }

  const jobDetails: Job = {
    ...body,
    businessId: user.uid,
    createdAt: new Date()
  };

  return await jobsRef
    .add({
      ...jobDetails,
      createdAt: firestore.Timestamp.fromDate(jobDetails.createdAt)
    })
    .then(async (job) => {
      return response.status(StatusCodes.CREATED).json({
        job: (await job.get()).data()
      });
    })
    .catch((err) => {
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong saving the job.',
        error: err
      });
    });
};

export const getJobList = async (request: Request, response: Response) => {
  // For some reason I need to set it to a random string if no token is provided
  const token = request.params.token ?? 'a';

  const jobs = await jobsRef
    .orderBy(firestore.FieldPath.documentId())
    .startAfter(token)
    .limit(10)
    .get();

  return response.status(StatusCodes.OK).json({
    jobs: jobs.docs.map((doc) => doc.data()),
    nextPageToken: jobs.docs.pop()?.ref.id
  });
};
