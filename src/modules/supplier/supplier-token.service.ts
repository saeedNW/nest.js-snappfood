import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TSupplierJwtOtpPayload } from "./types/jwt-payload.type";

@Injectable()
export class SupplierTokenService {
	constructor(
		/** register jwt service */
		private jwtService: JwtService
	) {}

	/**
	 * Create and return JWT OTP token
	 * @param {TSupplierJwtOtpPayload} payload - Data that will be used in token
	 * @returns {string} - JWT token
	 */
	createOtpToken(payload: TSupplierJwtOtpPayload): string {
		/** create otp token */
		return this.jwtService.sign(payload, {
			secret: process.env.OTP_TOKEN_SECRET,
			expiresIn: 60 * 2, // 2 Mins
		});
	}

	/**
	 * Verify JWT OTP Token
	 * @param {string} token - Client's OTP Token
	 * @throws {UnauthorizedException} Throws exceptions if the token is invalid or missing.
	 * @returns {TSupplierJwtOtpPayload} - Data object saved in JWT Payload
	 */
	verifyOtpToken(token: string): TSupplierJwtOtpPayload | never {
		try {
			/** Verify OTP JWT token */
			const payload = this.jwtService.verify(token, {
				secret: process.env.OTP_TOKEN_SECRET,
			});

			/** Throw error in case of invalid payload */
			if (typeof payload !== "object" && !("id" in payload)) {
				throw new UnauthorizedException("Authorization failed, please retry");
			}

			return payload;
		} catch (error) {
			throw new UnauthorizedException("Authorization failed, please retry");
		}
	}

	/**
	 * Create and return JWT access token
	 * @param {TSupplierJwtOtpPayload} payload - Data that will be used in token
	 * @returns {string} - JWT token
	 */
	createAccessToken(payload: TSupplierJwtOtpPayload): string {
		return this.jwtService.sign(payload, {
			secret: process.env.ACCESS_TOKEN_SECRET,
			expiresIn: "1y",
		});
	}

	/**
	 * Verify JWT access Token
	 * @param {string} token - Client's access Token
	 * @returns {TSupplierJwtOtpPayload} - Data object saved in JWT Payload
	 */
	verifyAccessToken(token: string): TSupplierJwtOtpPayload {
		try {
			/** Verify access token */
			const payload = this.jwtService.verify(token, {
				secret: process.env.ACCESS_TOKEN_SECRET,
			});

			/** Throw error in case of invalid payload */
			if (typeof payload !== "object" && !("id" in payload)) {
				throw new UnauthorizedException("Authorization failed, please retry");
			}

			return payload;
		} catch (error) {
			throw new UnauthorizedException("Authorization failed, please retry");
		}
	}
}
