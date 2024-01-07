export interface Comment {
	authorId: string;
	date: string;
	content: string; // saved as markdown, frontend should render the md
}

export interface Post {
	postId: string;
	authorId: string;
	date: string;
	title: string;
	content: string; // saved as markdown, frontend should render the md
	thumbnailUrl: string;
	comments: Comment[];
	isDonation?: boolean;
}
