import { Module } from "@nestjs/common";
import { OrderService } from "./order.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderEntity } from "./entity/order.entity";
import { OrderItemEntity } from "./entity/item.entity";
import { AuthModule } from "../auth/auth.module";
import { AddressEntity } from "../user/entity/address.entity";

@Module({
	imports: [
		AuthModule,
		TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, AddressEntity]),
	],
	controllers: [],
	providers: [OrderService],
})
export class OrderModule {}
