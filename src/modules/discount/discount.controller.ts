import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	ParseIntPipe,
} from "@nestjs/common";
import { DiscountService } from "./discount.service";
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { plainToClass } from "class-transformer";

@Controller("discount")
@ApiTags("Discount")
export class DiscountController {
	constructor(private readonly discountService: DiscountService) {}

	/**
	 * Create new discount
	 * @param createDiscountDto - New discount data
	 */
	@Post()
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	create(@Body() createDiscountDto: CreateDiscountDto) {
		/** filter client data and remove unwanted data */
		const filteredData = plainToClass(CreateDiscountDto, createDiscountDto, {
			excludeExtraneousValues: true,
		});

		return this.discountService.create(filteredData);
	}

	/**
	 * Retrieve all discounts
	 */
	@Get()
	findAll() {
		return this.discountService.findAll();
	}

	/**
	 * Remove a discount by its ID
	 * @param id - Discount ID
	 */
	@Delete(":id")
	remove(@Param("id", ParseIntPipe) id: number) {
		return this.discountService.remove(id);
	}
}
