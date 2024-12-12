import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class BasketDto {
	@ApiProperty()
	@Expose()
	foodId: number;
}

export class DiscountBasketDto {
	@ApiProperty()
	@Expose()
	code: string;
}
