import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from "@nestjs/common";
import { map } from "rxjs";

/**
 * Implement custom response logic for server responses.
 * This interceptor will change the servers success response
 * structure before sending it to client
 */
@Injectable()
export class ResponseTransformerInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler<any>): any {
		/** Handles the incoming response using an RxJS map operator to transform data */
		return next.handle().pipe(
			map((data) => {
				/** Extracting the HTTP response object from context object */
				const ctx = context.switchToHttp();
				const Response = ctx.getResponse();

				/** Retrieves the HTTP status code from the response */
				let statusCode: number = Response.statusCode;

				/** Return a simple response object containing message if the response data was a simple string */
				if (typeof data === "string") {
					return {
						statusCode,
						success: true,
						message: data,
					};
				}

				/** Define a default response message for the case if the response was a data object */
				let message: string = "Process ended successfully";

				/** Check if the data is and object with a message property */
				if (typeof data === "object" && "message" in data) {
					/** extract the message property value and store it to message */
					message = (data as { message: string }).message;
					/** remove the message property from data object */
					delete data["message"];
				}

				/** return a simple text response if data was empty */
				if (!data || Object.keys(data).length <= 0) {
					return {
						statusCode,
						success: true,
						message,
					};
				}

				/** Return a response containing a data object */
				return {
					statusCode,
					success: true,
					message,
					data,
				};
			})
		);
	}
}
