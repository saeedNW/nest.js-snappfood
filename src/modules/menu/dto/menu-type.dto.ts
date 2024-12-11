import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { Length } from "class-validator";

export class MenuTypeDto {
	@ApiProperty()
	@Length(3, 30)
	@Expose()
	title: string;

	@ApiProperty()
	@Expose()
	priority: number;
}
