import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class CreateFoodDto {
	@ApiProperty()
	@Expose()
	name: string;

	@ApiProperty({ format: "binary" })
	@Expose()
	image: string;

	@ApiProperty()
	@Expose()
	price: number;

	@ApiProperty()
	@Expose()
	discount: number;

	@ApiProperty()
	@Expose()
	description: string;

	@ApiProperty()
	@Expose()
	typeId: number;
}
