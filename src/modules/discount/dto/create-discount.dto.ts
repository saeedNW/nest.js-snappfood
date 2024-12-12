import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class CreateDiscountDto {
	@ApiProperty()
	@Expose()
	code: string;

	@ApiPropertyOptional()
	@Transform((params) =>
		!params.value || isNaN(parseFloat(params.value))
			? undefined
			: parseFloat(params.value)
	)
	@IsOptional()
	@IsNumber()
	@Expose()
	percent: number;

	@ApiPropertyOptional()
	@Transform((params) =>
		!params.value || isNaN(parseInt(params.value))
			? undefined
			: parseInt(params.value)
	)
	@IsOptional()
	@IsNumber()
	@Expose()
	amount: number;

	@ApiPropertyOptional()
	@Expose()
	expires_in: number;

	@ApiPropertyOptional()
	@Expose()
	limit: number;
}
