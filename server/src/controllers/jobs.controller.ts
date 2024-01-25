import { Request, Response } from 'express';
import { FirebaseError, firestore } from 'firebase-admin';
import { StatusCodes } from 'http-status-codes';
import { Job, JobLocationType, JobType } from '../../../shared/src/types/job';
import { jobsRef, profilesRef, skillsRef } from '../database';
import { formatJobsList, getJobWithUsers } from '../utils/job.util';
import { getMissingParameters } from '../utils/param.util';

export const createJob = async (request: Request, response: Response) => {
  const user = request.user;
  const body = request.body as Job;

  const invalidParams = await hasInvalidParams(request, false);
  if (invalidParams !== null) {
    const { status, ...resBody } = invalidParams;
    return response.status(status).json(resBody);
  }

  // Add the skills
  const skillIds = await Promise.all(
    body.skills.map(async (skill) => {
      const id = skill.toLowerCase();

      return await skillsRef
        .doc(id)
        .get()
        .then(async (sk) => {
          if (sk.exists) return sk.id;
          await skillsRef.doc(id).set({ name: skill });
          return id;
        });
    })
  );

  const jobDetails: Job = {
    ...body,
    businessId: user.uid,
    skills: skillIds,
    applicants: []
  };

  return await jobsRef
    .add(jobDetails)
    .then(async (job) => {
      const jobData = (await job.get()) as GenericDocument<Job>;
      const { businessId, ...data } = jobData.data();

      return response.status(StatusCodes.CREATED).json({
        id: jobData.id,
        business: user,
        ...data
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
  const token = request.params.token ?? ' ';
  const filter = (request.query.filter ?? '') as string;
  const end =
    filter.slice(0, filter.length - 1) +
    String.fromCharCode(filter.charCodeAt(filter.length - 1) + 1);

  let jobs;
  if (!filter) {
    jobs = await jobsRef
      .orderBy(firestore.FieldPath.documentId())
      .startAfter(token)
      .limit(10)
      .get();

    return response.status(StatusCodes.OK).json({
      jobs: await formatJobsList(jobs.docs as GenericDocument<Job>[]),
      nextPageToken: jobs.size === 10 ? jobs.docs.at(-1)?.id : undefined
    });
  }

  jobs = await jobsRef
    .orderBy('position')
    .where('position', '>=', filter)
    .where('position', '<', end)
    .orderBy(firestore.FieldPath.documentId())
    .startAfter(token)
    .limit(10)
    .get();

  if (jobs.size === 0) {
    const businesses = await profilesRef
      .orderBy('firstName')
      .where('firstName', '>=', filter)
      .where('firstName', '<', end)
      .orderBy(firestore.FieldPath.documentId())
      .startAfter(token)
      .limit(10)
      .get();

    if (businesses.size > 0) {
      const bizJobs = await Promise.all(
        businesses.docs.map(async (business) => {
          return await jobsRef
            .orderBy('businessId')
            .where('businessId', '==', business.id)
            .orderBy(firestore.FieldPath.documentId())
            .startAfter(token)
            .limit(10)
            .get();
        })
      );

      jobs = await formatJobsList(
        bizJobs
          .map((job) => job.docs)
          .reduce((acc, cur) => acc.concat(cur), []) as GenericDocument<Job>[]
      );

      return response.status(StatusCodes.OK).json({
        jobs: jobs,
        nextPageToken:
          jobs.length === 10 ? (jobs.at(-1) as any)?.id || undefined : undefined
      });
    }
  }

  return response.status(StatusCodes.OK).json({
    jobs: await formatJobsList(jobs.docs as GenericDocument<Job>[]),
    nextPageToken: jobs.size === 10 ? jobs.docs.at(-1)?.id : length
  });
};

export const getJobById = async (request: Request, response: Response) => {
  const id = request.params.id ?? '';

  return await jobsRef
    .doc(id)
    .get()
    .then(async (job) => {
      if (!job.exists) {
        return response.status(StatusCodes.NOT_FOUND).json({
          message: 'Job you are looking for cannot be found.'
        });
      }

      return await getJobWithUsers(job as GenericDocument<Job>)
        .then((jobData) => response.status(StatusCodes.OK).json(jobData))
        .catch((error: FirebaseError) => {
          return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message:
              'Something went wrong while trying to find the business of this job listing.',
            error
          });
        });
    })
    .catch((err) => {
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong while trying to find the job.',
        error: err
      });
    });
};

export const deleteJobById = async (request: Request, response: Response) => {
  const id = request.params.id ?? '';

  return await jobsRef
    .doc(id)
    .get()
    .then(async (job) => {
      if (!job.exists) {
        return response.status(StatusCodes.NOT_FOUND).json({
          message: 'Job you are trying to delete cannot be found.'
        });
      }

      return await job.ref
        .delete()
        .then(() => {
          return response.status(StatusCodes.OK).json({
            message: 'Job successfully deleted.'
          });
        })
        .catch((err) => {
          return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Something went wrong while trying to delete the job.',
            error: err
          });
        });
    })
    .catch((err) => {
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong while trying to delete the job.',
        error: err
      });
    });
};

export const editJobById = async (request: Request, response: Response) => {
  const id = request.params.id ?? '';

  const invalidParams = await hasInvalidParams(request, true);
  if (invalidParams !== null) {
    const { status, ...resBody } = invalidParams;
    return response.status(status).json(resBody);
  }

  return await jobsRef
    .doc(id)
    .get()
    .then(async (job) => {
      if (!job.exists) {
        return response.status(StatusCodes.NOT_FOUND).json({
          message: 'Job you are trying to edit cannot be found.'
        });
      }

      job.ref
        .set({
          id: job.id,
          ...job.data(),
          ...request.body
        })
        .then(() => {
          return response.status(StatusCodes.NO_CONTENT).json({
            message: 'Successfully updated job.'
          });
        })
        .catch((err) => {
          return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Something went wrong while trying to edit the job.',
            error: err
          });
        });
    })
    .catch((err) => {
      return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong while trying to edit the job.',
        error: err
      });
    });
};

const hasInvalidParams = async (request: Request, editing: boolean) => {
  type Body = Omit<Job, 'businessId' | 'createdAt'>;
  type Parameter = keyof Body;

  const requiredParams: Parameter[] = [
    'description',
    'locationType',
    'position',
    'type',
    'applicants'
  ];

  const body = request.body as Body;
  const missingParams = getMissingParameters(request, requiredParams);

  if (editing) {
    if (missingParams.length === requiredParams.length) {
      return {
        status: StatusCodes.BAD_REQUEST,
        message: 'Missing parameters.',
        missing: missingParams
      };
    }
  } else {
    if (missingParams.length > 0 || !body.skills || body.skills.length === 0) {
      return {
        status: StatusCodes.BAD_REQUEST,
        message: 'Missing parameters.',
        missing: !body.skills?.length
          ? [...missingParams, 'skills']
          : missingParams
      };
    }
  }

  if (body.type) {
    if (!Object.values(JobType).includes(body.type as JobType)) {
      return {
        status: StatusCodes.BAD_REQUEST,
        message: 'Unknown job type provided. Job type must be one of JobType.'
      };
    }
  }

  if (body.locationType) {
    if (
      !Object.values(JobLocationType).includes(
        body.locationType as JobLocationType
      )
    ) {
      return {
        status: StatusCodes.BAD_REQUEST,
        message:
          'Unknown location type provided. Location type must be one of JobLocationType.'
      };
    }
  }

  return null;
};
