import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { UserAuthDecorator } from "src/common/decorators/auth.decorator";
import { PaymentDto } from "./dto/payment.dto";
import { Response } from "express";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";

@Controller("payment")
@ApiTags("Payment")
export class PaymentController {
	constructor(private paymentService: PaymentService) {}

	@Post()
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@UserAuthDecorator()
	gatewayUrl(@Body() paymentDto: PaymentDto) {
		return this.paymentService.getGatewayUrl(paymentDto);
	}

	@Get("/verify")
	async verifyPayment(
		@Query("Authority") authority: string,
		@Query("Status") status: string,
		@Res() res: Response
	) {
		const url = await this.paymentService.verify(authority, status);
		return res.redirect(url);
	}
}
