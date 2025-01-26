import { HealthController } from "./health.controller";
import { Module } from "@nestjs/common";

/**
 * NestJS module that provides health check functionality.
 * A minimal module that exposes an endpoint for service health monitoring.
 * Used by Docker, load balancers, and monitoring systems to verify service status.
 */
@Module({
    imports: [],            // No external module dependencies
    controllers: [
        HealthController    // Handles health check endpoint
    ],
    providers: [],          // No additional services needed
    exports: [],            // No exports needed
})
export class HealthModule {}
