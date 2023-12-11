declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: string;
			CORS: string;
		}
	}
}

export {};
