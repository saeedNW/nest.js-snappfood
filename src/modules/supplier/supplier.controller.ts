import { Controller, Post, Body, Res, Put, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { SupplierService } from "./supplier.service";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import {
	SupplierCheckOtpDto,
	SupplierSendOtpDto,
} from "./dto/supplier-otp.dto";
import { Response } from "express";
import { plainToClass } from "class-transformer";
import { SupplierSignupDto } from "./dto/supplier-signup.dto";
import { SupplierAuthDecorator } from "src/common/decorators/auth.decorator";
import { SupplementaryInformationDto } from "./dto/Supplementary.dto";
import { UploadFileFieldsS3 } from "src/common/interceptor/file-uploader.interceptor";
import { UploadDocsDto } from "./dto/upload-doc.dto";

@Controller("supplier")
@ApiTags("Supplier")
export class SupplierController {
	constructor(private readonly supplierService: SupplierService) {}

	/**
	 * create and send OTP code to supplier's phone number
	 * @param res - client current request's response
	 * @param otpDto - client data need to generate and send OTP code
	 */
	@Post("/send-otp")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	sendOtp(
		@Res({ passthrough: true }) res: Response,
		@Body() otpDto: SupplierSendOtpDto
	) {
		/** filter client data and remove unwanted data */
		const filteredData = plainToClass(SupplierSendOtpDto, otpDto, {
			excludeExtraneousValues: true,
		});

		return this.supplierService.sendOtp(filteredData, res);
	}

	/**
	 * Supplier sign up process
	 * @param res - client current request's response
	 * @param supplierDto - client data need to generate and send OTP code
	 */
	@Post("/signup")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	signup(
		@Res({ passthrough: true }) res: Response,
		@Body() supplierDto: SupplierSignupDto
	) {
		/** filter client data and remove unwanted data */
		const filteredData = plainToClass(SupplierSignupDto, supplierDto, {
			excludeExtraneousValues: true,
		});

		return this.supplierService.signup(filteredData, res);
	}

	/**
	 * Validating client's OTP code
	 * @param checkOtpDto - Client OTP code
	 */
	@Post("/check-otp")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	checkOtp(@Body() checkOtpDto: SupplierCheckOtpDto) {
		/** filter client data and remove unwanted data */
		const { code } = plainToClass(SupplierCheckOtpDto, checkOtpDto, {
			excludeExtraneousValues: true,
		});

		return this.supplierService.checkOtp(code);
	}

	/**
	 * update clients supplementary information
	 * @param infoDto - Clients supplementary information
	 */
	@Post("/supplementary-information")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@SupplierAuthDecorator()
	supplementaryInformation(@Body() infoDto: SupplementaryInformationDto) {
		/** filter client data and remove unwanted data */
		const filteredData = plainToClass(SupplementaryInformationDto, infoDto, {
			excludeExtraneousValues: true,
		});

		return this.supplierService.saveSupplementaryInformation(filteredData);
	}

	/**
	 * Upload supplier documents
	 * @param infoDto - Document data
	 * @param files - Documents uploaded files
	 */
	@Put("/upload-documents")
	@ApiConsumes(SwaggerConsumes.MULTIPART_FORM_DATA)
	@SupplierAuthDecorator()
	@UseInterceptors(
		UploadFileFieldsS3([
			{ name: "acceptedDoc", maxCount: 1 },
			{ name: "image", maxCount: 1 },
		])
	)
	uploadDocument(@Body() infoDto: UploadDocsDto, @UploadedFiles() files: any) {
		return this.supplierService.uploadDocuments(files);
	}
}
