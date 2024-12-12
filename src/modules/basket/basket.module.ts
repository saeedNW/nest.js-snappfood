import { Module } from "@nestjs/common";
import { BasketService } from "./basket.service";
import { BasketController } from "./basket.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserBasketEntity } from "./entity/basket.entity";
import { MenuModule } from "../menu/menu.module";
import { DiscountService } from "../discount/discount.service";
import { AuthModule } from "../auth/auth.module";
import { DiscountEntity } from "../discount/entities/discount.entity";

@Module({
	imports: [
		AuthModule,
		MenuModule,
		TypeOrmModule.forFeature([UserBasketEntity, DiscountEntity]),
	],
	controllers: [BasketController],
	providers: [BasketService, DiscountService],
})
export class BasketModule {}
