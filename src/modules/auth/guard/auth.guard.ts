import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { isJWT } from "class-validator";
import { Request } from "express";
import { AuthService } from "../auth.service";
import { Reflector } from "@nestjs/core";
import { SKIP_AUTH } from "src/common/decorators/skip-auth.decorator";

/**
 * Guard to protect routes by validating access tokens.
 *
 * The `AuthGuard` class implements the `CanActivate` interface to control access
 * to routes based on user authentication. It retrieves and verifies an access
 * token from the `Authorization` header in incoming requests and attaches the
 * authenticated user data to the request object.
 *
 * @class
 * @implements {CanActivate} In NestJS all guards and custom guards must be implemented from CanActivate
 */
@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		/** Register auth service */
		private authService: AuthService,
		/** Register reflector which contains request's metadata */
		private reflector: Reflector
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> | never {
		/**
		 * Check is the skip authorization metadata has been set.
		 * ? This metadata normally won't be set on a class or variable, but
		 * ? it will be set on a request controller's method which is consider
		 * ? as a handler. So we need to retrieve the metadata names "SKIP_AUTH"
		 * ? in the context handler data which is the method that the "SkipAuth"
		 * ? decorator has been set for.
		 */
		const skippedAuth = this.reflector.get<boolean>(
			SKIP_AUTH,
			context.getHandler()
		);

		/** Skip authorization process if asked to */
		if (skippedAuth) return true;

		/** convert context to HTTP */
		const httpContext = context.switchToHttp();
		/** retrieve request object */
		const request: Request = httpContext.getRequest<Request>();
		/** retrieve token from client's request */
		const token: string = this.extractToken(request);

		/** validate token and retrieve user data */
		request.user = await this.authService.validateAccessToken(token);

		return true;
	}

	/**
	 * Extracts the access token from the `Authorization` header
	 * @param {Request} request - The incoming request object
	 * @throws {UnauthorizedException} - In case of invalid token throw "Unauthorized Exception" error
	 * @returns {string} The extracted JWT token
	 */
	protected extractToken(request: Request): string {
		/** retrieve authorization header from request's headers object */
		const { authorization } = request.headers;

		/** throw an error if authorization header was not set or if it was empty */
		if (!authorization || authorization?.trim() == "") {
			throw new UnauthorizedException("Authorization failed, please retry");
		}

		/** separate token from bearer keyword */
		const [bearer, token] = authorization?.split(" ");

		/** `throw error if the bearer keyword or the token were invalid */
		if (bearer?.toLowerCase() !== "bearer" || !token || !isJWT(token))
			throw new UnauthorizedException("Authorization failed, please retry");

		/** return the access token */
		return token;
	}
}
