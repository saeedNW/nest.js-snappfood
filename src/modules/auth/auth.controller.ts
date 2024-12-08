import { Body, Controller, Post, Res } from "@nestjs/common";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { CheckOtpDto, SendOtpDto } from "./dto/otp.dto";
import { Response } from "express";
import { plainToClass } from "class-transformer";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * create and send OTP code to user's phone number
	 * @param res - client current request's response
	 * @param sendOtpDto - client data need to generate and send OTP code
	 */
	@Post("/send-otp")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	sendOtp(
		@Res({ passthrough: true }) res: Response,
		@Body() sendOtpDto: SendOtpDto
	) {
		/** filter client data and remove unwanted data */
		const filteredData = plainToClass(SendOtpDto, sendOtpDto, {
			excludeExtraneousValues: true,
		});

		return this.authService.sendOtp(filteredData, res);
	}

	/**
	 * Validating client's OTP code
	 * @param checkOtpDto - Client OTP code
	 */
	@Post("/check-otp")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	checkOtp(@Body() checkOtpDto: CheckOtpDto) {
		/** filter client data and remove unwanted data */
		const { code } = plainToClass(CheckOtpDto, checkOtpDto, {
			excludeExtraneousValues: true,
		});

		return this.authService.checkOtp(code);
	}
}
