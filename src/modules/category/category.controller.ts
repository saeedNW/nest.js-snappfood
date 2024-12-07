import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseInterceptors,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { ApiConsumes } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { UploadFileS3 } from "src/common/interceptor/file-uploader.interceptor";
import { FileUploader } from "src/common/decorators/file-uploader.decorator";
import { plainToClass } from "class-transformer";

@Controller("category")
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	/**
	 * create new category
	 * @param createCategoryDto - category data
	 * @param image - uploaded image
	 */
	@Post()
	@ApiConsumes(SwaggerConsumes.MULTIPART_FORM_DATA)
	@UseInterceptors(UploadFileS3("image"))
	create(
		@FileUploader() image: Express.Multer.File,
		@Body() createCategoryDto: CreateCategoryDto
	) {
		/** filter client data and remove unwanted data */
		const filteredData = plainToClass(
			CreateCategoryDto,
			createCategoryDto,
			{
				excludeExtraneousValues: true,
			}
		);

		return this.categoryService.create(filteredData, image);
	}

	@Get()
	findAll() {
		return this.categoryService.findAll();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.categoryService.findOne(+id);
	}

	@Patch(":id")
	update(
		@Param("id") id: string,
		@Body() updateCategoryDto: UpdateCategoryDto
	) {
		return this.categoryService.update(+id, updateCategoryDto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.categoryService.remove(+id);
	}
}
