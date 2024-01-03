export interface Comment {
	authorId: string;
	content: string; // saved as markdown, frontend should render the md
}

export interface Post {
	authorId: string;
	title: string;
	content: string; // saved as markdown, frontend should render the md
	thumbnailUrl: string;
	comments: Comment[];
	isDonation?: boolean;
}
