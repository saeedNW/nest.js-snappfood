import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
	Scope,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserBasketEntity } from "./entity/basket.entity";
import { IsNull, Not, Repository } from "typeorm";
import { DiscountEntity } from "../discount/entities/discount.entity";
import { MenuService } from "../menu/service/menu.service";
import { DiscountService } from "../discount/discount.service";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { BasketDto, DiscountBasketDto } from "./dto/basket.dto";
import { TAnyObject } from "src/common/type/any-object.type";

@Injectable({ scope: Scope.REQUEST })
export class BasketService {
	constructor(
		/** Register user basket repository */
		@InjectRepository(UserBasketEntity)
		private basketRepository: Repository<UserBasketEntity>,

		/** Register discount repository */
		@InjectRepository(DiscountEntity)
		private discountRepository: Repository<DiscountEntity>,

		/** rEGISTER MENU SERVICE */
		private menuService: MenuService,

		/** rEGISTER DISCOUNT SERVICE */
		private discountService: DiscountService,

		/** rEGISTER REQUEST */
		@Inject(REQUEST) private request: Request
	) {}

	/**
	 * Adds a food item to the user's basket.
	 * @param {BasketDto} basketDto - DTO containing food item details to be added.
	 */
	async addToBasket(basketDto: BasketDto): Promise<string> {
		/** Extract user ID from request */
		const { id: userId } = this.request.user;
		/** Extract food ID from request body */
		const { foodId } = basketDto;

		/** Ensure the food item exists */
		await this.menuService.getOne(foodId);

		/** Check if the item already exists in the basket */
		let basketItem = await this.basketRepository.findOne({
			where: {
				userId,
				foodId,
			},
		});

		if (basketItem) {
			/** Increment the count if the item exists */
			basketItem.count += 1;
		} else {
			/** Create a new basket item if it doesn't exist */
			basketItem = this.basketRepository.create({
				foodId,
				userId,
				count: 1,
			});
		}

		/** Save the basket item to the repository */
		await this.basketRepository.save(basketItem);

		return "Item has been added to basket successfully";
	}

	/**
	 * Removes a food item from the user's basket.
	 * @param {BasketDto} basketDto - DTO containing food item details to be removed.
	 */
	async removeFromBasket(basketDto: BasketDto) {
		/** Extract user ID from request */
		const { id: userId } = this.request.user;
		/** Extract food ID from request body */
		const { foodId } = basketDto;

		/** Ensure the food item exists */
		await this.menuService.getOne(foodId);

		/** Check if the item exists in the basket */
		let basketItem = await this.basketRepository.findOne({
			where: {
				userId,
				foodId,
			},
		});

		/** Throw error if item was not in basket */
		if (!basketItem) {
			throw new NotFoundException("not found food item in basket");
		}

		if (basketItem.count <= 1) {
			/** Remove the item from basket if the count hit zero */
			await this.basketRepository.delete({ id: basketItem.id });
		} else {
			/** decrease the count if the item count is more than one */
			basketItem.count -= 1;
			await this.basketRepository.save(basketItem);
		}

		return "remove item from basket";
	}

	/**
	 * Adds a discount code to the user's basket
	 * @param {DiscountBasketDto} discountDto - The DTO containing the discount code.
	 */
	async addDiscount(discountDto: DiscountBasketDto) {
		/** destructure discount properties */
		const { code } = discountDto;
		/** Retrieve user ID from request */
		const { id: userId } = this.request.user;

		/** Fetch the discount by code */
		const discount = await this.discountService.findOneByCode(code);

		/** Validate the discount code */
		if (!discount || !discount.active) {
			throw new BadRequestException("This discount code is not active");
		}

		/** Check if discount usage limit is reached */
		if (discount.limit && discount.limit <= discount.usage) {
			throw new BadRequestException(
				"The capacity of this discount code is full"
			);
		}

		/** Check if the discount code is expired */
		if (discount.expires_in && discount.expires_in.getTime() <= Date.now()) {
			throw new BadRequestException("This discount code is expired");
		}

		/** Check if the user has already used this discount */
		const userBasketDiscount = await this.basketRepository.findOneBy({
			discountId: discount.id,
			userId,
		});

		if (userBasketDiscount) {
			throw new BadRequestException("Already used discount");
		}

		/** If the discount is supplier-specific, validate supplier-related conditions */
		if (discount.supplierId) {
			/** Check if the user has already used a discount from this supplier */
			const supplierDiscountInBasket = await this.basketRepository.findOne({
				relations: { discount: true },
				where: {
					userId,
					discount: { supplierId: discount.supplierId },
				},
			});

			if (supplierDiscountInBasket) {
				throw new BadRequestException(
					"You cannot use multiple discounts from the same supplier"
				);
			}

			/** Ensure the basket contains items from the discount's supplier */
			const supplierItemsInBasket = await this.basketRepository.findOne({
				relations: { food: true },
				where: {
					userId,
					food: { supplierId: discount.supplierId },
				},
			});

			if (!supplierItemsInBasket) {
				throw new BadRequestException(
					"You cannot use this discount code in your basket"
				);
			}
		} else if (!discount.supplierId) {
			/** Validate general discount rules for non-supplier-specific discounts */
			const generalDiscountInBasket = await this.basketRepository.findOne({
				relations: { discount: true },
				where: {
					userId,
					discount: {
						id: Not(IsNull()),
						supplierId: IsNull(),
					},
				},
			});

			if (generalDiscountInBasket) {
				throw new BadRequestException("Already used a general discount");
			}
		}

		/** Add the discount to the user's basket */
		await this.basketRepository.insert({
			discountId: discount.id,
			userId,
		});

		return "You added discount code successfully";
	}

	/**
	 * remove a discount code from the user's basket
	 * @param {DiscountBasketDto} discountDto - The DTO containing the discount code.
	 */
	async removeDiscount(discountDto: DiscountBasketDto) {
		/** destructure discount properties */
		const { code } = discountDto;
		/** Retrieve user ID from request */
		const { id: userId } = this.request.user;

		/** Fetch the discount by code */
		const discount = await this.discountService.findOneByCode(code);

		/** Check if the user has used the discount */
		const basketDiscount = await this.basketRepository.findOne({
			where: {
				discountId: discount.id,
				userId,
			},
		});

		if (!basketDiscount)
			throw new BadRequestException("Not found discount in basket");

		/** Remove the discount */
		await this.basketRepository.delete({ discountId: discount.id, userId });

		return "You deleted discount code successfully";
	}

	/**
	 * Fetches and calculates details for the user's basket, including
	 * total amounts, discounts, and individual food item details.
	 */
	async getBasket() {
		/** Extract user id from request */
		const { id: userId } = this.request.user;

		/** Fetch basket items with related food and discount details */
		const basketItems = await this.basketRepository.find({
			relations: {
				discount: true,
				food: { supplier: true },
			},
			where: { userId },
		});

		/** Separate basket items into categories */
		const foods = basketItems.filter((item) => item.foodId);
		const supplierDiscounts = basketItems.filter(
			(item) => item?.discount?.supplierId
		);
		const generalDiscount = basketItems.find(
			(item) => item?.discount?.id && !item.discount.supplierId
		);

		/** Process individual food items */
		const foodList = this.processFoods(foods, supplierDiscounts);

		/** Calculate total amounts and discounts */
		const totalAmount = foodList.reduce(
			(sum: number, item: TAnyObject) => sum + item.total_amount,
			0
		);
		let paymentAmount = foodList.reduce(
			(sum: number, item: TAnyObject) => sum + item.payment_amount,
			0
		);
		let totalDiscountAmount = foodList.reduce(
			(sum: number, item: TAnyObject) => sum + item.discount_amount,
			0
		);

		/** Apply general discounts to the basket */
		const generalDiscountDetail = this.applyGeneralDiscount(
			generalDiscount,
			paymentAmount
		);

		/** Recalculate payment amount and total discount */
		paymentAmount -= generalDiscountDetail.discount_amount || 0;
		totalDiscountAmount += generalDiscountDetail.discount_amount || 0;

		return {
			total_amount: totalAmount,
			paymentAmount,
			totalDiscountAmount,
			foodList,
			generalDiscountDetail,
		};
	}

	/**
	 * Processes the food items in the basket, calculates discounts, and returns detailed food data.
	 * @param {Array<any>} foods - Array of food items in the basket.
	 * @param {Array<any>} supplierDiscounts - Array of supplier-specific discounts.
	 */
	private processFoods(foods: Array<any>, supplierDiscounts: Array<any>) {
		return foods.map((item) => {
			/** Extract required data from item */
			const { food, count } = item;
			const supplierId = food.supplierId;

			/** Calculate initial price based on count */
			let foodPrice = food.price * count;
			/** Initialize discount amount */
			let discountAmount = 0;
			/** Initialize discount code */
			let discountCode: string = null;

			/** Calculate food-specific discount */
			if (food.is_active && food.discount > 0) {
				/** Apply food discount */
				const foodDiscount = foodPrice * (food.discount / 100);
				discountAmount += foodDiscount;
				foodPrice -= foodDiscount;
			}

			/** Apply supplier-specific discount */
			const supplierDiscountResult = this.applySupplierDiscount(
				supplierDiscounts,
				supplierId,
				foodPrice
			);

			discountAmount += supplierDiscountResult.discountAmount;
			foodPrice -= supplierDiscountResult.discountAmount;
			discountCode = supplierDiscountResult.discountCode;

			/** Return processed food details */
			return {
				foodId: food.id,
				name: food.name,
				description: food.description,
				count,
				image: food.image,
				price: food.price,
				/** Original total price */
				total_amount: food.price * count,
				/** Total discount applied */
				discount_amount: discountAmount,
				/** Final amount after discounts */
				payment_amount: food.price * count - discountAmount,
				discountCode,
				supplierId,
				supplierName: food?.supplier?.storeName,
				supplierImage: food?.supplier?.image,
			};
		});
	}

	/**
	 * Applies a supplier-specific discount to a food item.
	 * @param {Array<any>} supplierDiscounts - Array of supplier-specific discounts.
	 * @param {number} supplierId - ID of the supplier for the food item.
	 * @param {number} foodPrice - Current price of the food item.
	 */
	private applySupplierDiscount(
		supplierDiscounts: Array<any>,
		supplierId: number,
		foodPrice: number
	) {
		const supplierDiscountItem = supplierDiscounts.find(
			({ discount }) => discount.supplierId === supplierId
		);

		if (supplierDiscountItem) {
			/** Destructure discount data within supplier discount item */
			const {
				discount: { active, amount, percent, limit, usage, code },
			} = supplierDiscountItem;

			if (active && (!limit || usage < limit)) {
				let discountAmount = 0;

				/** Set discount code if applicable */
				let discountCode = code;

				if (percent > 0) {
					/** Apply percentage discount */
					discountAmount = foodPrice * (percent / 100);
				} else if (amount > 0) {
					/** Apply fixed amount discount */
					discountAmount = Math.min(amount, foodPrice);
				}

				return { discountAmount, discountCode };
			}
		}

		/** Return default values if no applicable supplier discount */
		return { discountAmount: 0, discountCode: null };
	}

	/**
	 * Applies a general discount to the payment amount.
	 * @param {TAnyObject} generalDiscount - General discount item.
	 * @param {number} paymentAmount - Current payment amount before applying the general discount.
	 */
	private applyGeneralDiscount(
		generalDiscount: TAnyObject,
		paymentAmount: number
	) {
		if (generalDiscount?.discount?.active) {
			const { discount } = generalDiscount;

			if (!discount.limit || discount.usage < discount.limit) {
				let generalDiscountAmount = 0;

				if (discount.percent > 0) {
					/** Apply percentage discount */
					generalDiscountAmount = paymentAmount * (discount.percent / 100);
				} else if (discount.amount > 0) {
					/** Apply fixed amount discount */
					generalDiscountAmount = discount.amount;
				}

				/** Ensure discount doesn't exceed payment amount */
				generalDiscountAmount = Math.min(generalDiscountAmount, paymentAmount);

				return {
					code: discount.code,
					percent: discount.percent,
					amount: discount.amount,
					/** Final discount applied */
					discount_amount: generalDiscountAmount,
				};
			}
		}

		/** Return empty if no applicable general discount */
		return {};
	}
}
