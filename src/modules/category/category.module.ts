import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryEntity } from "./entities/category.entity";
import { StorageService } from "../storage/storage.service";

@Module({
	imports: [TypeOrmModule.forFeature([CategoryEntity])],
	controllers: [CategoryController],
	providers: [CategoryService, StorageService],
})
export class CategoryModule {}
