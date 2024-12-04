/** Define swagger consumes type as an enum */
export enum SwaggerConsumes {
	/** Swagger form input type */
	URL_ENCODED = "application/x-www-form-urlencoded",
	/** Swagger raw json data type */
	JSON = "application/json",
	/** Swagger multipart form data type (Incase of uploading a file) */
	MULTIPART_FORM_DATA = "multipart/form-data",
}
