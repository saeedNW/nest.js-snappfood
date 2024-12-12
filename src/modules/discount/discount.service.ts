import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DiscountEntity } from "./entities/discount.entity";
import { DeepPartial, Repository } from "typeorm";

@Injectable()
export class DiscountService {
	constructor(
		@InjectRepository(DiscountEntity)
		private discountRepository: Repository<DiscountEntity>
	) {}

	/**
	 * Creates a new discount with the provided details.
	 * @param {CreateDiscountDto} createDiscountDto - DTO containing discount details.
	 */
	async create(createDiscountDto: CreateDiscountDto) {
		/** Destructure create data properties */
		const { amount, code, expires_in, limit, percent } = createDiscountDto;

		/** Check if the discount code already exists */
		await this.checkExistCode(code);

		/** Initialize the discount object */
		const discountObject: DeepPartial<DiscountEntity> = { code };

		/** Validate and assign either amount or percent (mutually exclusive) */
		if ((!amount && !percent) || (amount && percent)) {
			throw new BadRequestException(
				"You must enter one of the amount or percent fields "
			);
		}

		if (amount && !isNaN(parseFloat(amount.toString()))) {
			discountObject.amount = amount;
		} else if (percent && !isNaN(parseFloat(percent.toString()))) {
			discountObject.percent = percent;
		}

		/** Handle optional expiration date (expires_in) */
		if (expires_in && !isNaN(parseInt(expires_in.toString()))) {
			/** Convert days to milliseconds */
			const expirationTime = Date.now() + expires_in * 24 * 60 * 60 * 1000;
			discountObject.expires_in = new Date(expirationTime);
		}

		/** Handle optional limit */
		if (limit && !isNaN(Number(limit))) {
			discountObject.limit = Number(limit);
		}

		/** Create and save the discount entity */
		const discount = this.discountRepository.create(discountObject);
		await this.discountRepository.save(discount);

		return "Discount created successfully";
	}

	/**
	 * Retrieve all discounts
	 */
	async findAll() {
		return await this.discountRepository.find({});
	}

	async remove(id: number) {
		/** Check if discount exists */
		const discount = await this.discountRepository.findOneBy({ id });
		if (!discount) throw new NotFoundException();

		/** Remove discount from database */
		await this.discountRepository.delete({ id });

		return "Discount deleted successfully";
	}

	/**
	 * Checks if a discount code already exists in the database.
	 * @param {string} code - The discount code to check.
	 * @returns {Promise<void>} Resolves if the code does not exist.
	 * @throws {ConflictException} If the discount code already exists.
	 */
	async checkExistCode(code: string): Promise<void> {
		// Query the repository for the given discount code
		const discount = await this.discountRepository.findOneBy({ code });

		if (discount) {
			throw new ConflictException("The discount code already exists.");
		}
	}

	/**
	 * Finds a discount by its code.
	 * @param {string} code - The discount code to search for.
	 * @returns {Promise<DiscountEntity>} The discount entity if found.
	 * @throws {NotFoundException} If the discount code is not found.
	 */
	async findOneByCode(code: string): Promise<DiscountEntity> {
		// Query the repository for the given discount code
		const discount = await this.discountRepository.findOneBy({ code });

		if (!discount) {
			throw new NotFoundException("The discount code was not found.");
		}

		return discount;
	}
}
