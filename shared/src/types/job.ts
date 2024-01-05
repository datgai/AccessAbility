export enum JobType {
	FULL_TIME = 'full-time',
	PART_TIME = 'part-time',
	CONTRACT = 'contract',
	INTERNSHIP = 'internship',
	APPRENTICESHIP = 'apprenticeship',
	SEASONAL = 'seasonal',
}

export enum JobLocationType {
	ON_SITE = 'on-site',
	HYBRID = 'hybrid',
	REMOTE = 'remote',
}

export interface Job {
	businessId: string;
	position: string;
	type: JobType;
	locationType: JobLocationType;
	description: string;
	skills: string[];
	applicants: string[];
}

export interface Skill {
	name: string; // id of skill uses the name but lowercased
}
