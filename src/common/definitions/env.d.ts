/**
 * Extend the 'ProcessEnv' interface in the NodeJS namespace to create
 * globally accessible types for environment variables.
 *
 * Adding types here provides type suggestions when accessing variables
 * through 'process.env'.
 */
namespace NodeJS {
	interface ProcessEnv {
		/** Application configuration */
		NODE_ENV: string;
		SERVER_LINK: string;
		PORT: number;

		/** Database configuration */
		DB_PORT: number;
		DB_NAME: string;
		DB_USERNAME: string;
		DB_PASSWORD: string;
		DB_HOST: string;

		/** Liara S3 cloud storage configuration */
		S3_SECRET_KEY: string;
		S3_ACCESS_KEY: string;
		S3_BUCKET_NAME: string;
		S3_ENDPOINT: string;

		/** Secrets */
		COOKIE_SECRET: string;
		OTP_TOKEN_SECRET: string;
		ACCESS_TOKEN_SECRET: string;

		/** SMS.ir */
		SMS_IR_API_KEY: string;
		SMS_IR_SEND_URL: string;
	}
}
