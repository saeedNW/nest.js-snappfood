import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get } from "@nestjs/common";

/**
 * Controller providing health check endpoint for service monitoring.
 * Used by Docker healthcheck and monitoring systems to verify service status.
 */
@Controller("health")
@ApiTags("Health")
export class HealthController {
	/**
	 * Retrieves the service's health status.
	 * Returns a simple "GOOD" response if the service is operational.
	 * Used by:
	 * - Docker health check (see Dockerfile HEALTH CHECK)
	 * - Load balancers
	 * - Monitoring systems
	 *
	 * @returns "GOOD" if the service is healthy
	 */
	@ApiOperation({
		summary: "Retrieves the service's health status",
	})
	@ApiResponse({ status: 200, description: "OK", example: { statusCode: 200, success: true, message: "GOOD" } })
	@Get()
	public getHealth(): string {
		return "GOOD";
	}
}
