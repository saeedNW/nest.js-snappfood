import {
	BadRequestException,
	Inject,
	Injectable,
	Scope,
	UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../user/entity/user.entityt";
import { Repository } from "typeorm";
import { OtpEntity } from "../user/entity/otp.entity";
import { REQUEST } from "@nestjs/core";
import { Request, Response } from "express";
import { SendOtpDto } from "./dto/otp.dto";
import { randomInt } from "crypto";
import { TAuthResponse } from "./types/response";
import { tokenCookieOptions } from "src/common/utils/cookie.utils";
import { TokenService } from "./token.service";
import { SmsIrService } from "../http/sms-ir.service";
import { CookiesName } from "src/common/enums/cookies-name.enum";

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
	constructor(
		/** inject user repository */
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,

		/** inject otp repository */
		@InjectRepository(OtpEntity)
		private otpRepository: Repository<OtpEntity>,

		/** make the current request accessible in service  */
		@Inject(REQUEST)
		private request: Request,

		/** Register token service */
		private tokenService: TokenService,

		/** Register sms service */
		private smsIrService: SmsIrService
	) {}

	async sendOtp(sendOtpDto: SendOtpDto, res: Response) {
		/** destructure client data */
		const { phone } = sendOtpDto;

		/** retrieve user's data from database */
		let user: UserEntity = await this.getUser(phone);

		if (!user) {
			/** create new user and save it in database */
			user = this.userRepository.create({ phone });
			user = await this.userRepository.save(user);
		}

		/** create OTP data */
		const otp: OtpEntity = await this.saveOtp(user.id);

		/** Generate user's otp token */
		const token = this.tokenService.createOtpToken({ userId: user.id });

		/** Send OTP code to the client's phone */
		await this.sendOtpSms(phone, otp.code);

		/** send response to client */
		return this.sendOtpResponse(res, { token, code: otp.code });
	}

	/**
	 * Retrieve user's data based on the given phone number
	 * @param {string} phone - The input data sent by client
	 * @returns {Promise<UserEntity> | null} Return the retrieved user from database
	 */
	async getUser(phone: string): Promise<UserEntity> | null {
		return await this.userRepository.findOneBy({ phone });
	}

	/**
	 * Create new OTP code and save it in database if needed
	 * @param {number} userId - User's data id
	 * @returns {Promise<OtpEntity>} - returns OTP data
	 */
	async saveOtp(userId: number): Promise<OtpEntity> {
		/** create a random 5 digit number */
		const code: string = randomInt(10000, 99999).toString();
		/** set the expires time of the OTP for 2 min */
		const expires_in = new Date(Date.now() + 1000 * 60 * 2);

		/** check if user already has an otp or not */
		let otp: OtpEntity = await this.otpRepository.findOneBy({ userId });

		/**
		 * Define a boolean to be used in case of new OTP
		 * creation to save the OTP id in user's data
		 */
		let newOtp: boolean = true;

		if (otp) {
			newOtp = false;

			/** throw error if OTP not expired */
			if (otp.expires_in > new Date()) {
				throw new BadRequestException("OTP code is not expire");
			}

			/** update otp data */
			otp.code = code;
			otp.expires_in = expires_in;
		} else {
			/** create new otp */
			otp = this.otpRepository.create({ code, expires_in, userId });
		}

		/** save otp data */
		otp = await this.otpRepository.save(otp);

		/** update user's otp data in case if the OTP is newly created */
		if (newOtp) {
			await this.userRepository.update({ id: userId }, { otpId: otp.id });
		}

		return otp;
	}

	/**
	 * Send OTP code to clients phone number or email address based on auth method
	 * @param {string} phone - The input data sent by client
	 * @param {string} code - OTP code
	 */
	async sendOtpSms(phone: string, code: string) {
		/** Send OTP code to user if application was run in production mode */
		if (process.env?.NODE_ENV === "production") {
			/** Send SMS to client if the authorization method was phone */
			await this.smsIrService.sendVerificationSms(phone, code);
		}
	}

	/**
	 * Send authorization process response to client
	 * @param {Response} res - Express response object
	 * @param {TAuthResponse} result - Login/register process result
	 */
	async sendOtpResponse(res: Response, result: TAuthResponse) {
		/** extract data from authentication process result */
		const { token, code } = result;
		/** Set a cookie in user browser ti be used in future auth processes */
		res.cookie(CookiesName.OTP_COOKIE, token, tokenCookieOptions());

		const responseData = {
			message: "OTP code sent successfully",
		};

		/** add token and to response data if project isn't in production */
		if (process.env?.NODE_ENV !== "production") {
			responseData["code"] = code;
			responseData["token"] = token;
		}

		return responseData;
	}

	/**
	 * OTP code verification
	 * @param code - User's OTP code
	 */
	async checkOtp(code: string) {
		/** Extract client's otp token from current request */
		const token: string | undefined =
			this.request.signedCookies?.[CookiesName.OTP_COOKIE];

		/** throw error if token was undefined */
		if (!token) {
			throw new UnauthorizedException("OTP code is expire");
		}

		/** Verify OTP token and extract user id from it */
		const { userId } = this.tokenService.verifyOtpToken(token);

		/** Retrieve OTP data */
		const otp = await this.otpRepository.findOne({
			where: { userId },
			relations: { user: true },
		});

		/** Throw error if OTP was not found */
		if (!otp) {
			throw new UnauthorizedException("Authorization failed, please retry");
		}

		const now = new Date();

		/** Throw error if OTP was expired */
		if (otp.expires_in < now) {
			throw new UnauthorizedException("OTP code expired");
		}

		/** Throw error if OTP code was invalid */
		if (otp.code !== code) {
			throw new UnauthorizedException("Invalid OTP code");
		}

		/** create client's access token */
		const accessToken = this.tokenService.createAccessToken({ userId });

		/** VERIFY USER'S PHONE NUMBER */
		if (!otp.user.verify_phone) {
			await this.userRepository.update(
				{ id: userId },
				{
					verify_phone: true,
				}
			);
		}

		return {
			message: "You have logged in successfully",
			accessToken,
		};
	}

	/**
	 * Clients' access token validation process
	 * @param {string} token - Access token retrieved from client's request
	 * @throws {UnauthorizedException} - In case of invalid token throw "Unauthorized Exception" error
	 * @returns {Promise<UserEntity | never>} - Returns user's data or throw an error
	 */
	async validateAccessToken(token: string): Promise<UserEntity | never> {
		/** extract user's id from access token */
		const { userId } = this.tokenService.verifyAccessToken(token);

		/** retrieve user's data from database */
		const user = await this.userRepository.findOneBy({ id: userId });

		/** throw error if user was not found */
		if (!user) {
			throw new UnauthorizedException("Authorization failed, please retry");
		}

		/** return user's data */
		return user;
	}
}
