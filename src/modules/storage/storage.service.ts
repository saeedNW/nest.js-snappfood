import { Injectable } from "@nestjs/common";
import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { basename, extname } from "path";

/**
 * Integration of AWS S3 using AWS SDK v3
 *
 * ? AWS S3 (Simple Storage Service) is a scalable object storage service used
 * ? for storing and retrieving any amount of data. In a NestJS application,
 * ? we leverage AWS SDK v3 to interact with S3 for tasks like uploading,
 * ? downloading, or deleting files.
 */
@Injectable()
export class StorageService {
	/** Define a private readonly instance of S3Client */
	private readonly s3Client: S3Client;

	constructor() {
		/**
		 * Initialize S3Client
		 */
		this.s3Client = new S3Client({
			region: "default",
			endpoint: process.env.S3_ENDPOINT,
			credentials: {
				accessKeyId: process.env.S3_ACCESS_KEY,
				secretAccessKey: process.env.S3_SECRET_KEY,
			},
		});
	}

	/**
	 * Upload file to Liara S3 cloud storage service
	 * @param {Express.Multer.File} file - Uploaded file buffer
	 * @param {string} folderName - The name of the folder where the file should be stored
	 */
	async uploadFile(file: Express.Multer.File, folderName: string) {
		/** Extract the file extension and convert it to lowercase */
		const ext: string = extname(file?.originalname || "").toLowerCase();

		/** Extract the base name of the file and replace spaces with hyphens */
		const originalName: string = basename(
			file?.originalname || "",
			extname(file?.originalname || "")
		).replace(/\s/g, "-");

		/** Generate a unique file name for the uploaded file */
		const fileName = String(Date.now() + "-" + originalName + ext);

		/** Define bucket name and file upload location */
		const Bucket = process.env.S3_BUCKET_NAME;
		const Key = `${folderName}/${fileName}`;

		/** Create a PutObjectCommand instance */
		const command = new PutObjectCommand({
			Bucket,
			Key,
			Body: file.buffer,
		});

		/** Send the command to the S3 client */
		await this.s3Client.send(command);

		/** Define the full URL of the uploaded file */
		const Location = `${process.env.S3_ENDPOINT}/${Bucket}/${Key}`;

		return { Location, Key };
	}

	/**
	 * Remove a file uploaded to S3 cloud storage
	 * @param {string} Key - The path to the file in Liara S3 cloud storage
	 */
	async deleteFile(Key: string) {
		/** Create a DeleteObjectCommand instance */
		const command = new DeleteObjectCommand({
			Bucket: process.env.S3_BUCKET_NAME,
			Key: decodeURI(Key),
		});

		/** Send the command to the S3 client */
		return await this.s3Client.send(command);
	}
}
