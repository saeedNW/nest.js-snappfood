import {
	Body,
	Controller,
	Delete,
	FileTypeValidator,
	Get,
	MaxFileSizeValidator,
	Param,
	ParseFilePipe,
	ParseIntPipe,
	Post,
	Put,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import { MenuService } from "../service/menu.service";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { SupplierAuthDecorator } from "src/common/decorators/auth.decorator";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { UploadFileS3 } from "src/common/interceptor/file-uploader.interceptor";
import { CreateFoodDto } from "../dto/create-food.dto";
import { FileUploader } from "src/common/decorators/file-uploader.decorator";
import { SkipAuth } from "src/common/decorators/skip-auth.decorator";
import { UpdateFoodDto } from "../dto/update-food.dto";

@Controller("menu")
@ApiTags("menu")
@SupplierAuthDecorator()
export class MenuController {
	constructor(private readonly menuService: MenuService) {}

	/**
	 * Creates a new food item with the given details and image.
	 * @param {CreateFoodDto} foodDto - The DTO containing food item details.
	 * @param {Express.Multer.File} image - The uploaded image file.
	 */
	@Post()
	@ApiConsumes(SwaggerConsumes.MULTIPART_FORM_DATA)
	@UseInterceptors(UploadFileS3("image"))
	create(
		@Body() foodDto: CreateFoodDto,
		@FileUploader() image: Express.Multer.File
	) {
		return this.menuService.create(foodDto, image);
	}

	/**
	 * Retrieves all menu items for the given menu ID.
	 * @param {number} id - The ID of the menu.
	 */
	@Get("/get-menu-by-supplierId/:id")
	@SkipAuth()
	findAll(@Param("id", ParseIntPipe) id: number) {
		return this.menuService.findAll(id);
	}

	/**
	 * Retrieves a specific menu item by its ID.
	 * @param {number} id - The ID of the menu item.
	 */
	@Get("/:id")
	findOne(@Param("id", ParseIntPipe) id: number) {
		return this.menuService.findOne(id);
	}

	/**
	 * Deletes a specific menu item by its ID.
	 * @param {number} id - The ID of the menu item to delete.
	 */
	@Delete("/:id")
	delete(@Param("id", ParseIntPipe) id: number) {
		return this.menuService.delete(id);
	}
}
