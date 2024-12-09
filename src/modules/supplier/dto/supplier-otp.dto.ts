import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsPhoneNumber, IsString, Length } from "class-validator";

/**
 * User authentication process DTO
 */
export class SupplierSendOtpDto {
	@ApiProperty()
	@IsString()
	@IsPhoneNumber("IR", { message: "Invalid phone number" })
	@Expose()
	phone: string;
}

/**
 * Client Check OTP process validator
 */
export class SupplierCheckOtpDto {
	@ApiProperty()
	@IsString()
	@Length(5, 5, { message: "Invalid OTP code" })
	@Expose()
	code: string;
}
