import { Request, Response } from 'express';
import { firestore } from 'firebase-admin';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import { Resource } from '../../../shared/src/types/resource';
import { UserRole } from '../../../shared/src/types/user';
import { resourcesRef } from '../database';
import { getError, saveImage, upload } from '../services/uploader.service';
import { getMissingParameters } from '../utils/param.util';
import { populateResource } from '../utils/resource.util';

export const getResources = async (request: Request, response: Response) => {
  const user = request.user;
  const token = request.params.token ?? ' ';

  let resources;

  // if (user.profile.role !== UserRole.ADMIN) {
  //   resources = await resourcesRef
  //     .orderBy('verified')
  //     .where('verified', '==', true)
  //     .orderBy(firestore.FieldPath.documentId())
  //     .startAfter(token)
  //     .limit(10)
  //     .get();
  // } else {
  resources = await resourcesRef
    .orderBy(firestore.FieldPath.documentId())
    .startAfter(token)
    .limit(10)
    .get();
  // }

  const resourcesDocs = resources.docs as GenericDocument<Resource>[];
  return response.status(StatusCodes.OK).json({
    resources: await Promise.all(
      resourcesDocs.map(async (resource) => await populateResource(resource))
    ),
    nextPageToken:
      resourcesDocs.length === 10 ? resourcesDocs.at(-1)?.id : undefined
  });
};

export const getResourcesByAuthorId = async (
  request: Request,
  response: Response
) => {
  const user = request.user;
  const authorId = request.params.authorId ?? ' ';
  const token = request.params.token ?? ' ';

  let resources;

  if (user.profile.role !== UserRole.ADMIN) {
    resources = await resourcesRef
      .orderBy('authorId')
      .where('authorId', '==', authorId)
      .orderBy(firestore.FieldPath.documentId())
      .startAfter(token)
      .orderBy('verified')
      .where('verified', '==', true)
      .limit(10)
      .get();
  } else {
    resources = await resourcesRef
      .orderBy('authorId')
      .where('authorId', '==', authorId)
      .orderBy(firestore.FieldPath.documentId())
      .startAfter(token)
      .limit(10)
      .get();
  }

  const resourcesDocs = resources.docs as GenericDocument<Resource>[];
  return response.status(StatusCodes.OK).json({
    resources: await Promise.all(
      resourcesDocs.map(async (resource) => await populateResource(resource))
    ),
    nextPageToken:
      resourcesDocs.length === 10 ? resourcesDocs.at(-1)?.id : undefined
  });
};

export const getResourceById = async (request: Request, response: Response) => {
  const user = request.user;
  const id = request.params.id ?? ' ';

  const resource = (await resourcesRef
    .doc(id)
    .get()) as GenericDocument<Resource>;

  if (!resource.exists) {
    return response.status(StatusCodes.NOT_FOUND).json({
      message: 'Resource not found.'
    });
  }

  if (!resource.data().verified && user.profile.role !== UserRole.ADMIN) {
    return response.status(StatusCodes.FORBIDDEN).json({
      message: 'This resource is not yet verified and thus cannot be accessed.'
    });
  }

  return response.status(StatusCodes.OK).json(await populateResource(resource));
};

export const createResource = async (request: Request, response: Response) => {
  const user = request.user;

  upload.single('thumbnail')(request, response, async (err) => {
    const error = getError(err);
    if (error !== null) {
      return response.status(error.status).json({ message: error.message });
    }

    type Body = Pick<Resource, 'title' | 'description' | 'price'>;
    const body = request.body as Body;

    const missingParams = getMissingParameters<keyof Body>(request, [
      'title',
      'description',
      'price'
    ]);

    if (missingParams.length > 0) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        messsage: 'Missing parameters.',
        missing: missingParams
      });
    }

    let thumbnailUrl: string = '';
    if (request.file) {
      const baseUrl = `${request.protocol}://${request.get('host')}`;
      const thumbnail = request.file!;
      const buffer = thumbnail.buffer;
      const originalName = thumbnail.originalname;

      try {
        thumbnailUrl = await saveImage(
          baseUrl,
          path.join('thumbnails', 'resources'),
          buffer,
          originalName
        );
      } catch (error: any) {
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: `Something went wrong processing the file: ${error.message}`
        });
      }
    }

    const resourceDetails: Resource = {
      authorId: user.uid,
      title: body.title,
      description: body.description,
      thumbnailUrl: thumbnailUrl,
      price: body.price * 100,
      verified: false,
      createdAt: new Date()
    };

    return await resourcesRef
      .add({
        ...resourceDetails,
        createdAt: firestore.Timestamp.fromDate(resourceDetails.createdAt)
      })
      .then(async (reference) => {
        const resource = (await reference.get()) as GenericDocument<Resource>;

        return response
          .status(StatusCodes.CREATED)
          .json(populateResource(resource));
      })
      .catch((error) => {
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'Something went wrong saving the resource.',
          error
        });
      });
  });
};

export const editResource = async (request: Request, response: Response) => {
  const user = request.user;
  const id = request.params.id;

  if (!id) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      message: 'No resource id provided.'
    });
  }

  upload.single('thumbnail')(request, response, async (err) => {
    const error = getError(err);
    if (error !== null) {
      return response.status(error.status).json({ message: error.message });
    }

    const resource = (await resourcesRef
      .doc(id)
      .get()) as GenericDocument<Resource>;

    if (!resource) {
      return response.status(StatusCodes.NOT_FOUND).json({
        message: 'Could not find resource that you are trying to edit.'
      });
    }

    // Only the resource author and admins can edit the resource
    if (
      resource.data().authorId !== user.uid ||
      user.profile.role !== UserRole.ADMIN
    ) {
      return response.status(StatusCodes.FORBIDDEN).json({
        message: 'You are not allowed to edit this resource.'
      });
    }

    const body = request.body as Partial<Resource>;

    let thumbnailUrl: string = '';
    if (request.file) {
      const baseUrl = `${request.protocol}://${request.get('host')}`;
      const thumbnail = request.file!;
      const buffer = thumbnail.buffer;
      const originalName = thumbnail.originalname;

      try {
        thumbnailUrl = await saveImage(
          baseUrl,
          path.join('thumbnails', 'resources'),
          buffer,
          originalName
        );
      } catch (error: any) {
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: `Something went wrong processing the file: ${error.message}`
        });
      }
    }

    // Only admins can change verified status
    const verifiedStatus =
      user.profile.role === UserRole.ADMIN
        ? body.verified ?? resource.data().verified
        : resource.data().verified;

    const resourceData: Resource = {
      authorId: resource.data().authorId,
      title: body.title ?? resource.data().title,
      description: body.description ?? resource.data().description,
      thumbnailUrl: thumbnailUrl || resource.data().thumbnailUrl,
      verified: verifiedStatus,
      price: body.price ? body.price * 100 : resource.data().price,
      createdAt: resource.data().createdAt // already a timestamp sice it's not populated
    };

    return await resourcesRef
      .doc(id)
      .set({
        ...resourceData
      })
      .then(() => {
        return response.status(StatusCodes.CREATED).json({
          message: 'Successfully updated resource.'
        });
      })
      .catch((error) => {
        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: 'Something went wrong saving the resource.',
          error
        });
      });
  });
};
