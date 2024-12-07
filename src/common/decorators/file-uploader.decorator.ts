import {
	FileTypeValidator,
	MaxFileSizeValidator,
	ParseFilePipe,
	UploadedFile,
} from "@nestjs/common";

/**
 * A custom decorator for handling file uploads in controllers.
 * Combines Uploaded Files with a ParseFilePipe into a custom decorator
 * to make the controller code cleaner and easier to maintain.
 */
export function FileUploader() {
	return UploadedFile(
		new ParseFilePipe({
			validators: [
				new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
				new FileTypeValidator({ fileType: "image/(png|jpg|jpeg|webp)" }),
			],
		})
	);
}
