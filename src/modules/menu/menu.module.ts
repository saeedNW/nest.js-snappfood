import { Module } from "@nestjs/common";
import { MenuService } from "./service/menu.service";
import { MenuController } from "./controller/menu.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MenuEntity } from "./entity/menu.entity";
import { TypeEntity } from "./entity/type.entity";
import { FeedbackEntity } from "./entity/feedback.entity";
import { MenuTypeController } from "./controller/type.controller";
import { MenuTypeService } from "./service/type.service";
import { SupplierModule } from "../supplier/supplier.module";

@Module({
	imports: [
		SupplierModule,
		TypeOrmModule.forFeature([MenuEntity, TypeEntity, FeedbackEntity]),
	],
	controllers: [MenuController, MenuTypeController],
	providers: [MenuService, MenuTypeService],
	exports: [MenuService, MenuTypeService, TypeOrmModule],
})
export class MenuModule {}
