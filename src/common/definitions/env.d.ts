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
		SERVER_LINK: string; // Application's Server URL address
		PORT: number; // Port number for the application

		/** Database configuration */
		DB_PORT: number; // Database server port
		DB_NAME: string; // Name of the database
		DB_USERNAME: string; // Database username
		DB_PASSWORD: string; // Database password
		DB_HOST: string; // Database host address
	}
}
