import { ApiProperty } from "@nestjs/swagger";

export class UploadDocsDto {
	@ApiProperty({ format: "binary" })
	acceptedDoc: string;

	@ApiProperty({ format: "binary" })
	image: string;
}
