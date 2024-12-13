import { HttpService } from "@nestjs/axios";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { lastValueFrom, map } from "rxjs";
import { TAnyObject } from "src/common/type/any-object.type";

@Injectable()
export class ZarinpalService {
	constructor(private httpService: HttpService) {}

	/**
	 * Sends a payment request to Zarinpal.
	 * @param {TAnyObject} [data] - The request data.
	 */
	async sendRequest(data?: TAnyObject) {
		/** Extracting required fields from input data */
		const { amount, description, user } = data;

		/** Preparing the payload request data for the Zarinpal request */
		const requestData = {
			/** Merchant ID from environment variables */
			merchant_id: process.env.ZARINPAL_MERCHANT_ID,
			/** Convert amount to the correct unit (e.g., Toman to Rial) */
			amount: amount * 10,
			/** Description of the payment */
			description,
			metadata: {
				/** Default email if none provided */
				email: user?.email ?? "example@gmail.com",
				/** Default empty mobile if none provided */
				mobile: user?.mobile ?? "",
			},
			/** Callback URL after payment */
			callback_url: `${process.env.SERVER_LINK}/payment/verify`,
		};

		try {
			/** Sending a POST request to Zarinpal and retrieving the response */
			const result = await lastValueFrom(
				this.httpService
					.post(process.env.ZARINPAL_REQUEST_URL, requestData)
					/** Extract data from the response */
					.pipe(map((res) => res.data))
			);

			/** Extract authority and code from the response */
			const { authority, code } = result.data;

			/** Check if the response code and authority are valid */
			if (code == 100 && authority) {
				return {
					/** Response code */
					code,
					/** Payment authority code */
					authority,
					/** Gateway URL for payment */
					gatewayURL: `${process.env.ZARINPAL_GATEWAY_URL}/${authority}`,
				};
			}

			/** Throw an error if the response code or authority is invalid */
			throw new InternalServerErrorException("connection failed in Zarinpal");
		} catch (err) {
			console.log(err.response.data);
			/** Catch and rethrow errors with additional context */
			throw new InternalServerErrorException(
				"Zarinpal Payment: " + err.response?.data?.errors?.message ||
					err.message
			);
		}
	}

	/**
	 * Verifies a payment request with Zarinpal.
	 * @param {TAnyObject} [data] - The verification data.
	 */
	async verifyRequest(data?: TAnyObject) {
		/** Preparing the payload options for the Zarinpal verification request */
		const option = {
			/** Payment authority code */
			authority: data.authority,
			/** Convert amount to the correct unit (e.g., Toman to Rial) */
			amount: data.amount * 10,
			/** Merchant ID from environment variables */
			merchant_id: process.env.ZARINPAL_MERCHANT_ID,
		};

		try {
			/** Sending a POST request to Zarinpal for verification and retrieving the response */
			const result = await lastValueFrom(
				this.httpService
					.post(process.env.ZARINPAL_VERIFY_URL, option, {})
					/** Extract data from the response */
					.pipe(map((res) => res.data))
			);

			/** Return the verification result */
			return result;
		} catch (err) {
			/** Catch and rethrow errors with additional context */
			throw new InternalServerErrorException(
				"Zarinpal Verify: " + err.message || err.response?.data.message
			);
		}
	}
}
