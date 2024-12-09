import { Module } from "@nestjs/common";
import { SupplierService } from "./supplier.service";
import { SupplierController } from "./supplier.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SupplierEntity } from "./entities/supplier.entity";

@Module({
	imports: [TypeOrmModule.forFeature([SupplierEntity])],
	controllers: [SupplierController],
	providers: [SupplierService],
})
export class SupplierModule {}
