export enum UserRole {
	USER = 'user',
	BUSINESS = 'business',
	ADMIN = 'admin',
}

export interface UserProfile {
	role: UserRole;
	premium: boolean;
}
