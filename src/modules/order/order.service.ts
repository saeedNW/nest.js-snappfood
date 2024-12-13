import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
	Scope,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { OrderEntity } from "./entity/order.entity";
import { DataSource, DeepPartial, Repository } from "typeorm";
import { AddressEntity } from "../user/entity/address.entity";
import { TBasketType } from "../basket/type/basket.type";
import { PaymentDto } from "../payment/dto/payment.dto";
import { OrderStatus } from "./enum/order-status.enum";
import { OrderItemEntity } from "./entity/item.entity";
import { OrderItemStatus } from "./enum/order-item.status";

@Injectable({ scope: Scope.REQUEST })
export class OrderService {
	constructor(
		@Inject(REQUEST) private req: Request,

		@InjectRepository(OrderEntity)
		private orderRepository: Repository<OrderEntity>,

		@InjectRepository(AddressEntity)
		private userAddressRepository: Repository<AddressEntity>,

		private dataSource: DataSource
	) {}

	/**
	 * Creates a new order based on the provided basket and payment details.
	 * @param {TBasketType} basket - The basket containing food items and payment details.
	 * @param {PaymentDto} paymentDto - The payment data transfer object containing address and optional description.
	 * @returns {Promise<OrderEntity>} The created order entity.
	 */
	async create(
		basket: TBasketType,
		paymentDto: PaymentDto
	): Promise<OrderEntity> {
		const { addressId, description = undefined } = paymentDto;

		/** Initialize a database query runner for transaction management */
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			/** Extract user ID from the request */
			const { id: userId } = this.req.user;

			/** Find the user's address by ID and user ID */
			const address = await this.userAddressRepository.findOneBy({
				id: addressId,
				userId,
			});

			if (!address) throw new NotFoundException("not found address");

			const { foodList, paymentAmount, total_amount, totalDiscountAmount } =
				basket;

			/** Create a new order entity */
			let order = queryRunner.manager.create(OrderEntity, {
				addressId,
				userId,
				total_amount,
				description,
				payment_amount:paymentAmount,
				discount_amount: totalDiscountAmount,
				status: OrderStatus.PENDING,
			});

			/** Save the order entity */
			order = await queryRunner.manager.save(OrderEntity, order);

			/** Prepare order items from the food list */
			const orderItems: DeepPartial<OrderItemEntity>[] = foodList.map(
				(item) => ({
					count: item.count,
					foodId: item.foodId,
					orderId: order.id,
					status: OrderItemStatus.PENDING,
					supplierId: item.supplierId,
				})
			);

			/** Validate and insert order items */
			if (orderItems.length > 0) {
				await queryRunner.manager.insert(OrderItemEntity, orderItems);
			} else {
				throw new BadRequestException("your food list is empty");
			}

			/** Commit the transaction */
			await queryRunner.commitTransaction();
			return order;
		} catch (error) {
			/** Rollback the transaction in case of error */
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			/** Release the query runner */
			await queryRunner.release();
		}
	}

	/**
	 * Finds an order by its ID.
	 * @param {number} id - The ID of the order to find.
	 */
	async findOne(id: number): Promise<OrderEntity> {
		const order = await this.orderRepository.findOneBy({ id });
		if (!order) {
			throw new NotFoundException("Order not found");
		}
		return order;
	}

	/**
	 * Saves an order to the database.
	 * @param {OrderEntity} order - The order entity to save.
	 * @returns {Promise<OrderEntity>} The saved order entity.
	 */
	async save(order: OrderEntity): Promise<OrderEntity> {
		return await this.orderRepository.save(order);
	}
}
