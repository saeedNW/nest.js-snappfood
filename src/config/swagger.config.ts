import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SecuritySchemeObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

/**
 * initialize swagger document
 * @param app NestJS Application instance
 */
export function swaggerConfiguration(app: INestApplication) {
	/** define the swagger options and configs */
	const document = new DocumentBuilder()
		.setTitle("NestJS Snappfood")
		.setDescription("Practical experience of Snappfood")
		.setVersion("0.0.1")
		/**
		 * ? Enable Swagger Bearer authentication
		 * This configuration allows Swagger to include the "Authorization" header
		 * with a Bearer token in request headers for endpoints where authentication is required.
		 * The .addBearerAuth() method specifies the authorization scheme and the header's name.
		 * Ensure you use the same "Authorization" name as the key for Bearer tokens in
		 * your endpoint decorators where authentication should be enforced.
		 */
		.addBearerAuth(swaggerBearerAuthConfig(), "Authorization")
		.build();

	/** Initialize swagger document based on defined options */
	const swaggerDocument = SwaggerModule.createDocument(app, document);

	/** setup swagger ui page */
	SwaggerModule.setup("/api-doc", app, swaggerDocument);
}

/**
 * define and return swagger bearer auth scheme
 * @returns {SecuritySchemeObject} - Swagger bearer Auth scheme object
 */
function swaggerBearerAuthConfig(): SecuritySchemeObject {
	return {
		type: "http",
		bearerFormat: "JWT",
		in: "header",
		scheme: "bearer",
	};
}
