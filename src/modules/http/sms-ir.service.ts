import { HttpService } from "@nestjs/axios";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { SmsTemplate } from "./enums/sms-template.enum";
import { lastValueFrom, map } from "rxjs";

@Injectable()
export class SmsIrService {
	constructor(
		/** Register axios http service */
		private httpService: HttpService
	) {}

	/**
	 * Send phone verification code to user
	 * @param mobile - User's phone number
	 * @param code - User's verification code
	 */
	async sendVerificationSms(mobile: string, code: string): Promise<void> {
		/** Create request valid data structure */
		const data = {
			mobile,
			templateId: SmsTemplate.VERIFY,
			parameters: [{ name: "CODE", value: code }],
		};

		/** Extract sms ir related ENVs from process */
		const { SMS_IR_SEND_URL, SMS_IR_API_KEY } = process.env;

		/** Create request valid headers structure */
		const headers = {
			"content-type": "application/json",
			Accept: "text/plain",
			"x-api-key": SMS_IR_API_KEY,
		};

		try {
			/** Send the request to sms.ir */
			await lastValueFrom(
				this.httpService
					.post(SMS_IR_SEND_URL, data, {
						headers,
					})
					.pipe(map((res) => res.data))
			);
		} catch (error) {
			/** Catch and throw errors */
			throw new InternalServerErrorException(
				"SMSIR: " + error.response?.data.message || error.message
			);
		}
	}
}
