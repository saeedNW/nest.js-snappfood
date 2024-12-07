import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { resolve } from "path";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfig } from "src/config/typeorm.config";
import { CategoryModule } from "../category/category.module";

@Module({
	imports: [
		/** Load environment variables from the specified .env file through 'ConfigModule' */
		ConfigModule.forRoot({
			envFilePath: resolve(".env"),
			isGlobal: true,
		}),

		/** Load TypeOrm configs and stablish database connection */
		TypeOrmModule.forRoot(TypeOrmConfig()),

		/** Register modules */
		CategoryModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
