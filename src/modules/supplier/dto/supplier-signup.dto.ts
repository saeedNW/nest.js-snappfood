import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import {
	IsMobilePhone,
	IsNumber,
	IsNumberString,
	Length,
} from "class-validator";

export class SupplierSignupDto {
	@ApiProperty()
	@IsMobilePhone("fa-IR")
	@Expose()
	phone: string;

	@ApiProperty()
	@Length(3, 20)
	@Expose()
	managerName: string;

	@ApiProperty()
	@Length(3, 20)
	@Expose()
	managerFamily: string;

	@ApiProperty()
	@Length(3, 100)
	@Expose()
	storeName: string;

	@ApiProperty()
	@Transform((params) =>
		!params.value || isNaN(parseInt(params.value))
			? undefined
			: parseInt(params.value)
	)
	@IsNumber()
	@Expose()
	categoryId: number;

	@ApiProperty()
	@Length(3, 150)
	@Expose()
	city: string;

	@ApiPropertyOptional()
	reagent: string;
}
