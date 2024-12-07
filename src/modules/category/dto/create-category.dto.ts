import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import {
	IsBooleanString,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from "class-validator";

export class CreateCategoryDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@Expose()
	title: string;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	@Expose()
	slug: string;

	@ApiProperty({ format: "binary" })
	@Expose()
	image: string;

	@ApiProperty({ type: "boolean", default: false })
	@IsNotEmpty()
	@Expose()
	show: boolean;

	@ApiPropertyOptional()
	@Transform((params) => (!params.value ? undefined : parseInt(params.value)))
	@IsOptional()
	@IsNumber()
	@Expose()
	parentId: number;
}
