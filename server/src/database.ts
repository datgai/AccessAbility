import { database } from './firebase';

export const profilesRef = database.collection('profiles');
export const postsRef = database.collection('posts');
export const jobsRef = database.collection('jobs');
export const skillsRef = database.collection('skills');
export const resourcesRef = database.collection('resources');
export const transactionRef = database.collection('transactions');