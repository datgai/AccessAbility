export interface Resource {
	authorId: string;
	title: string;
	description: string; // saved as markdown, frontend should render the md
	thumbnailUrl: string;
	price: number; // saved as an integer
	verified: boolean;
	createdAt: Date;
}
