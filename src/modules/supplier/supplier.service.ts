import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	Scope,
	UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SupplierEntity } from "./entities/supplier.entity";
import { Repository } from "typeorm";
import { SupplierSignupDto } from "./dto/supplier-signup.dto";
import { CategoryService } from "../category/category.service";
import { SupplierSendOtpDto } from "./dto/supplier-otp.dto";
import { SupplierOtpEntity } from "./entities/supplier-otp.entity";
import { randomInt } from "crypto";
import { REQUEST } from "@nestjs/core";
import { SupplierTokenService } from "./supplier-token.service";
import { SmsIrService } from "../http/sms-ir.service";
import { Request, Response } from "express";
import { TSupplierAuthResponse } from "./types/response";
import { tokenCookieOptions } from "src/common/utils/cookie.utils";
import { CookiesName } from "src/common/enums/cookies-name.enum";
import { SupplementaryInformationDto } from "./dto/Supplementary.dto";
import { SupplierStatus } from "./enum/status.enum";
import { DocumentsType } from "./types/documents.type";
import { StorageService } from "../storage/storage.service";

@Injectable({ scope: Scope.REQUEST })
export class SupplierService {
	constructor(
		/** inject supplier repository */
		@InjectRepository(SupplierEntity)
		private supplierRepository: Repository<SupplierEntity>,

		/** inject supplier otp repository */
		@InjectRepository(SupplierOtpEntity)
		private supplierOtpRepository: Repository<SupplierOtpEntity>,

		/** Register category service */
		private categoryService: CategoryService,

		/** make the current request accessible in service  */
		@Inject(REQUEST)
		private request: Request,

		/** Register token service */
		private supplierTokenService: SupplierTokenService,

		/** Register sms service */
		private smsIrService: SmsIrService,

		/** Register cloud storage service */
		private storageService: StorageService
	) {}

	/**
	 * Supplier sign up process
	 * @param signupDto - client's provided data required for sign up process
	 * @param res - Current request's response
	 */
	async signup(signupDto: SupplierSignupDto, res: Response) {
		/** destructure provided data */
		const {
			categoryId,
			city,
			managerFamily,
			managerName,
			phone,
			reagent,
			storeName,
		} = signupDto;

		/** Check for duplicated supplier */
		const supplier = await this.supplierRepository.findOneBy({ phone });
		if (supplier) throw new ConflictException("supplier account already exist");

		/** Retrieve supplier-related category */
		const category = await this.categoryService.findOneById(categoryId);

		/** retrieve data of the reagent that invited the client */
		let agent: SupplierEntity = null;
		if (reagent) {
			agent = await this.supplierRepository.findOneBy({ inviteCode: reagent });
		}

		/** Create an invitation code for client */
		const mobileNumber = parseInt(phone);
		const inviteCode = mobileNumber.toString(32).toUpperCase();

		/** Create supplier account */
		const account = this.supplierRepository.create({
			managerName,
			managerFamily,
			phone,
			categoryId: category.id,
			city,
			storeName,
			reagentId: agent?.id ?? null,
			inviteCode,
		});

		/** Save supplier account to database */
		await this.supplierRepository.save(account);

		/** create OTP data */
		const otp: SupplierOtpEntity = await this.saveSupplierOtp(account.id);

		/** Generate user's otp token */
		const token = this.supplierTokenService.createOtpToken({
			supplierId: account.id,
		});

		/** Send OTP code to the client's phone */
		await this.sendOtpSms(phone, otp.code);

		/** send response to client */
		return this.sendOtpResponse(res, { token, code: otp.code });
	}

	/**
	 * supplier send otp (login) process
	 * @param otpDto - client's phone number
	 * @param res - Current request's response
	 */
	async sendOtp(otpDto: SupplierSendOtpDto, res: Response) {
		/** Extract client's phone number */
		const { phone } = otpDto;

		/** retrieve user's data from database */
		let supplier = await this.supplierRepository.findOneBy({ phone });

		/** Throw error if supplier was not found */
		if (!supplier) {
			throw new UnauthorizedException("not found account");
		}

		/** create OTP data */
		const otp: SupplierOtpEntity = await this.saveSupplierOtp(supplier.id);

		/** Generate user's otp token */
		const token = this.supplierTokenService.createOtpToken({
			supplierId: supplier.id,
		});

		/** Send OTP code to the client's phone */
		await this.sendOtpSms(phone, otp.code);

		/** send response to client */
		return this.sendOtpResponse(res, { token, code: otp.code });
	}

	/**
	 * Create new OTP code and save it in database if needed
	 * @param {number} supplierId - supplier's data id
	 * @returns {Promise<SupplierOtpEntity>} - returns OTP data
	 */
	async saveSupplierOtp(supplierId: number): Promise<SupplierOtpEntity> {
		/** create a random 5 digit number */
		const code: string = randomInt(10000, 99999).toString();
		/** set the expires time of the OTP for 2 min */
		const expires_in = new Date(Date.now() + 1000 * 60 * 2);

		/** check if user already has an otp or not */
		let otp: SupplierOtpEntity = await this.supplierOtpRepository.findOneBy({
			supplierId,
		});

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
			otp = this.supplierOtpRepository.create({ code, expires_in, supplierId });
		}

		/** save otp data */
		otp = await this.supplierOtpRepository.save(otp);

		/** update user's otp data in case if the OTP is newly created */
		if (newOtp) {
			await this.supplierRepository.update(
				{ id: supplierId },
				{ otpId: otp.id }
			);
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
	async sendOtpResponse(res: Response, result: TSupplierAuthResponse) {
		/** extract data from authentication process result */
		const { token, code } = result;
		/** Set a cookie in user browser ti be used in future auth processes */
		res.cookie(CookiesName.SUPPLIER_OTP_COOKIE, token, tokenCookieOptions());

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
			this.request.signedCookies?.[CookiesName.SUPPLIER_OTP_COOKIE];

		/** throw error if token was undefined */
		if (!token) {
			throw new UnauthorizedException("OTP code is expire");
		}

		/** Verify OTP token and extract user id from it */
		const { supplierId } = this.supplierTokenService.verifyOtpToken(token);

		/** Retrieve OTP data */
		const otp = await this.supplierOtpRepository.findOne({
			where: { supplierId },
			relations: { supplier: true },
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
		const accessToken = this.supplierTokenService.createAccessToken({
			supplierId,
		});

		/** VERIFY USER'S PHONE NUMBER */
		if (!otp.supplier.verify_phone) {
			await this.supplierRepository.update(
				{ id: supplierId },
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
	 */
	async validateSupplierAccessToken(token: string) {
		/** extract supplier's id from access token */
		const { supplierId } = this.supplierTokenService.verifyAccessToken(token);

		/** retrieve supplier's data from database */
		const supplier = await this.supplierRepository.findOneBy({
			id: supplierId,
		});

		/** throw error if supplier was not found */
		if (!supplier) {
			throw new UnauthorizedException("Authorization failed, please retry");
		}

		/** return supplier's data */
		return {
			id: supplier.id,
			firstName: supplier.managerName,
			lastName: supplier.managerFamily,
			phone: supplier.phone,
		};
	}

	/**
	 * update clients supplementary information
	 * @param infoDto - Clients supplementary information
	 */
	async saveSupplementaryInformation(infoDto: SupplementaryInformationDto) {
		/** Get user's id from request */
		const { id } = this.request.user;

		/** Destructure data sent by client */
		const { email, nationalCode } = infoDto;

		/** Check for duplicated national code */
		let supplier = await this.supplierRepository.findOneBy({ nationalCode });
		if (supplier && supplier.id !== id) {
			throw new ConflictException("national code already used");
		}

		/** Check for duplicated email address */
		supplier = await this.supplierRepository.findOneBy({ email });
		if (supplier && supplier.id !== id) {
			throw new ConflictException("email already used");
		}

		/** Update supplier's data */
		await this.supplierRepository.update(
			{ id },
			{
				email,
				nationalCode,
				status: SupplierStatus.SUPPLEMENTARY_INFORMATION,
			}
		);

		return "information updated successfully";
	}

	/**
	 * Upload supplier documents
	 * @param infoDto - Document data
	 * @param files - Documents uploaded files
	 */
	async uploadDocuments(files: DocumentsType) {
		/** Get user's id from request */
		const { id } = this.request.user;

		/** Destructure files sent by client */
		const { image, acceptedDoc } = files;

		/** retrieve supplier data */
		const supplier = await this.supplierRepository.findOneBy({ id });

		/** Upload image file to cloud storage */
		const imageResult = await this.storageService.uploadFile(
			image[0],
			"images"
		);

		/** Upload document file to cloud storage */
		const docsResult = await this.storageService.uploadFile(
			acceptedDoc[0],
			"acceptedDoc"
		);

		/** Update supplier image and document files info */
		if (imageResult) supplier.image = imageResult.Location;
		if (docsResult) supplier.document = docsResult.Location;

		/** Update supplier's register status to uploaded files */
		supplier.status = SupplierStatus.UPLOADED_DOCUMENT;

		/** Save suppliers data in database */
		await this.supplierRepository.save(supplier);

		return "Documents uploaded successfully";
	}
}
