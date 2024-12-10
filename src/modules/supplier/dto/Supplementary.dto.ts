import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEmail, IsIdentityCard } from "class-validator";

export class SupplementaryInformationDto {
	@ApiProperty()
	@IsEmail()
	@Expose()
	email: string;

	@ApiProperty()
	@IsIdentityCard("IR")
	@Expose()
	nationalCode: string;
}
