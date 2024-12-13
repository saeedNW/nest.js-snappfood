import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentEntity } from "./entity/payment.entity";
import { AuthModule } from "../auth/auth.module";
import { UserBasketEntity } from "../basket/entity/basket.entity";
import { DiscountEntity } from "../discount/entities/discount.entity";
import { MenuEntity } from "../menu/entity/menu.entity";
import { TypeEntity } from "../menu/entity/type.entity";
import { OrderEntity } from "../order/entity/order.entity";
import { AddressEntity } from "../user/entity/address.entity";
import { BasketService } from "../basket/basket.service";
import { MenuService } from "../menu/service/menu.service";
import { DiscountService } from "../discount/discount.service";
import { MenuTypeService } from "../menu/service/type.service";
import { OrderService } from "../order/order.service";
import { StorageService } from "../storage/storage.service";

@Module({
	imports: [
		AuthModule,
		TypeOrmModule.forFeature([
			UserBasketEntity,
			DiscountEntity,
			MenuEntity,
			TypeEntity,
			OrderEntity,
			AddressEntity,
			PaymentEntity,
		]),
	],
	controllers: [PaymentController],
	providers: [
		PaymentService,
		BasketService,
		MenuService,
		DiscountService,
		MenuTypeService,
		OrderService,
		StorageService,
	],
})
export class PaymentModule {}
