import { Body, Controller, Delete, Get, Post } from "@nestjs/common";
import { BasketService } from "./basket.service";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { UserAuthDecorator } from "src/common/decorators/auth.decorator";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { BasketDto, DiscountBasketDto } from "./dto/basket.dto";
import { plainToClass } from "class-transformer";

@Controller("basket")
@ApiTags("Basket")
@UserAuthDecorator()
export class BasketController {
	constructor(private basketService: BasketService) {}

	/**
	 * Adds a food item to the user's basket.
	 * @param {BasketDto} basketDto - DTO containing food item details to be added.
	 */
	@Post()
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	addToBasket(@Body() basketDto: BasketDto) {
		/** filter client data and remove unwanted data */
		const filteredData = plainToClass(BasketDto, basketDto, {
			excludeExtraneousValues: true,
		});

		return this.basketService.addToBasket(filteredData);
	}

	/**
	 * Removes a food item from the user's basket.
	 * @param {BasketDto} basketDto - DTO containing food item details to be removed.
	 */
	@Delete()
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	removeFromBasket(@Body() basketDto: BasketDto) {
		/** filter client data and remove unwanted data */
		const filteredData = plainToClass(BasketDto, basketDto, {
			excludeExtraneousValues: true,
		});

		return this.basketService.removeFromBasket(filteredData);
	}

	/**
	 * Adds a discount code to the user's basket
	 * @param {DiscountBasketDto} discountDto - The DTO containing the discount code.
	 */
	@Post("/discount")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	addDiscountToBasket(@Body() discountDto: DiscountBasketDto) {
		/** filter client data and remove unwanted data */
		const filteredData = plainToClass(DiscountBasketDto, discountDto, {
			excludeExtraneousValues: true,
		});

		return this.basketService.addDiscount(filteredData);
	}

	/**
	 * remove a discount code from the user's basket
	 * @param {DiscountBasketDto} discountDto - The DTO containing the discount code.
	 */
	@Delete("/discount")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	removeDiscountFromBasket(@Body() discountDto: DiscountBasketDto) {
		/** filter client data and remove unwanted data */
		const filteredData = plainToClass(DiscountBasketDto, discountDto, {
			excludeExtraneousValues: true,
		});

		return this.basketService.removeDiscount(filteredData);
	}

	/**
	 * Retrieve basket data
	 */
	@Get()
	getBasket() {
		return this.basketService.getBasket();
	}
}
