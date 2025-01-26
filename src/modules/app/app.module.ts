import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { resolve } from "path";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfig } from "src/config/typeorm.config";
import { CategoryModule } from "../category/category.module";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";
import { CustomHttpModule } from "../http/http.module";
import { SupplierModule } from "../supplier/supplier.module";
import { MenuModule } from "../menu/menu.module";
import { DiscountModule } from "../discount/discount.module";
import { BasketModule } from "../basket/basket.module";
import { OrderModule } from "../order/order.module";
import { PaymentModule } from "../payment/payment.module";
import { HealthModule } from "../health/health.module";

@Module({
	imports: [
		/** Conditionally load .env.dev file in development */
		ConfigModule.forRoot({
			envFilePath: process.env.NODE_ENV !== 'production' ? resolve('./env/.env.dev') : undefined,
			isGlobal: true,
		}),

		/** Load TypeOrm configs and stablish database connection */
		TypeOrmModule.forRoot(TypeOrmConfig()),

		/** Register modules */
		AuthModule,
		UserModule,
		CustomHttpModule,
		CategoryModule,
		SupplierModule,
		MenuModule,
		DiscountModule,
		BasketModule,
		OrderModule,
		PaymentModule,
		HealthModule
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
