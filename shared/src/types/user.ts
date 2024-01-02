export enum UserRole {
	USER = 'user',
	BUSINESS = 'business',
	ADMIN = 'admin',
}

export enum UserGender {
	MALE = 'male',
	FEMALE = 'female',
	OTHER = 'other',
}

export interface UserProfile {
	firstName: string;
	lastName: string;
	gender: UserGender;
	dateOfBirth: Date;
	phoneNumber: string;
	impairments: string[];
	city: string;
	state: string;
	address: string;
	bio: string;
	profilePictureUrl: string;
	role: UserRole;
	premium: boolean;
}
