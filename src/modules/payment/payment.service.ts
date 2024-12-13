import {
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
	Scope,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { BasketService } from "../basket/basket.service";
import { ZarinpalService } from "../http/zarinpal.service";
import { OrderService } from "../order/order.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaymentEntity } from "./entity/payment.entity";
import { PaymentDataDto, PaymentDto } from "./dto/payment.dto";
import { Request } from "express";
import { OrderStatus } from "../order/enum/order-status.enum";

@Injectable({ scope: Scope.REQUEST })
export class PaymentService {
	constructor(
		@Inject(REQUEST) private request: Request,

		@InjectRepository(PaymentEntity)
		private paymentRepository: Repository<PaymentEntity>,

		private basketService: BasketService,

		private zarinpalService: ZarinpalService,

		private orderService: OrderService
	) {}

	/**
	 * Handles the process of generating a payment gateway URL.
	 * @param {PaymentDto} paymentDto - Data transfer object containing payment details.
	 */
	async getGatewayUrl(paymentDto: PaymentDto) {
		/** Extract the user ID from the request object */
		const { id: userId } = this.request.user;

		/** Retrieve the user's basket details */
		const basket = await this.basketService.getBasket();

		/** Create a new order using the basket and payment details */
		const order = await this.orderService.create(basket, paymentDto);

		/** Create a new payment record */
		const payment = await this.create({
			amount: basket.paymentAmount,
			orderId: order.id,
			/** Auto-confirm if payment amount is zero */
			status: basket.paymentAmount === 0,
			userId,
			invoice_number: new Date().getTime().toString(),
		});

		if (!payment.status) {
			/** Send a request to the payment gateway (e.g., Zarinpal) to generate a payment URL */
			const { authority, code, gatewayURL } =
				await this.zarinpalService.sendRequest({
					amount: basket.paymentAmount,
					description: "PAYMENT ORDER",
					user: { email: "erfan@gmail.com", mobile: "09332255768" },
				});

			/** Store the authority returned by the payment gateway in the payment record */
			payment.authority = authority;

			/** Save the updated payment record in the database */
			await this.paymentRepository.save(payment);

			/** Return the gateway URL and status code */
			return {
				gatewayURL,
				code,
			};
		}

		/** If no payment was required, return a success message */
		return "payment successfully";
	}

	/**
	 * Creates a new payment record.
	 * @param {PaymentDataDto} paymentDto - Data transfer object containing payment information.
	 */
	async create(paymentDto: PaymentDataDto) {
		const { amount, invoice_number, orderId, status, userId } = paymentDto;

		/** Create a new payment entity */
		const payment = this.paymentRepository.create({
			amount,
			invoice_number,
			orderId,
			status,
			userId,
		});

		/** Save the payment entity in the database and return it */
		return await this.paymentRepository.save(payment);
	}

	/**
	 * Verifies a payment and updates the order status accordingly.
	 * @param {string} authority - The authority token returned by the payment gateway.
	 * @param {string} status - The payment status returned by the gateway (e.g., "OK").
	 */
	async verify(authority: string, status: string) {
		/** Find the payment record by its authority token */
		const payment = await this.paymentRepository.findOneBy({ authority });

		/** Throw if the payment does not exist */
		if (!payment) throw new NotFoundException();

		/** Throw if the payment is already verified */
		if (payment.status) throw new ConflictException("already verified");

		if (status !== "OK") {
			return "http://frontendurl.com/payment?status=failed";
		}

		/** Update the order status to PAID if the payment was successful */
		const order = await this.orderService.findOne(payment.orderId);
		order.status = OrderStatus.PAID;
		await this.orderService.save(order);

		/** Mark the payment as verified */
		payment.status = true;
		/** Save the updated payment record in the database */
		await this.paymentRepository.save(payment);

		/** Return a success URL if the payment verification was successful */
		return "http://frontendurl.com/payment?status=success";
	}
}
