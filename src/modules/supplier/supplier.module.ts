import { Module } from "@nestjs/common";
import { SupplierService } from "./supplier.service";
import { SupplierController } from "./supplier.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SupplierEntity } from "./entities/supplier.entity";
import { SupplierOtpEntity } from "./entities/supplier-otp.entity";
import { JwtService } from "@nestjs/jwt";
import { SupplierTokenService } from "./supplier-token.service";
import { CategoryService } from "../category/category.service";
import { CategoryEntity } from "../category/entities/category.entity";
import { StorageService } from "../storage/storage.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			SupplierEntity,
			SupplierOtpEntity,
			CategoryEntity,
		]),
	],
	controllers: [SupplierController],
	providers: [
		SupplierService,
		JwtService,
		SupplierTokenService,
		StorageService,
		CategoryService,
	],
	exports: [
		SupplierService,
		JwtService,
		SupplierTokenService,
		StorageService,
		TypeOrmModule,
	],
})
export class SupplierModule {}
