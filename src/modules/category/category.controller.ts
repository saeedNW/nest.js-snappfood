import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseInterceptors,
	Query,
	ParseIntPipe,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { ApiConsumes } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { UploadFileS3 } from "src/common/interceptor/file-uploader.interceptor";
import { FileUploader } from "src/common/decorators/file-uploader.decorator";
import { PaginationDto } from "src/common/dto/pagination.dto";
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
		const filteredData = plainToClass(CreateCategoryDto, createCategoryDto, {
			excludeExtraneousValues: true,
		});

		return this.categoryService.create(filteredData, image);
	}

	/**
	 * Retrieve all categories
	 * @param paginationDto - pagination related data
	 */
	@Get()
	findAll(@Query() paginationDto: PaginationDto) {
		/** filter client pagination data and remove unwanted data */
		const filteredPaginationData = plainToClass(PaginationDto, paginationDto, {
			excludeExtraneousValues: true,
		});

		return this.categoryService.findAll(filteredPaginationData);
	}

	/**
	 * retrieve single category by slug
	 * @param {string} slug - category's slug
	 */
	@Get("/by-slug/:slug")
	findBySlug(@Param("slug") slug: string) {
		return this.categoryService.findBySlug(slug);
	}

	/**
	 * Update category data
	 * @param id - category id number
	 * @param updateCategoryDto - new data to be updated
	 * @param image - category new image
	 */
	@Patch(":id")
	@ApiConsumes(SwaggerConsumes.MULTIPART_FORM_DATA)
	@UseInterceptors(UploadFileS3("image"))
	update(
		@Param("id", ParseIntPipe) id: number,
		@FileUploader() image: Express.Multer.File,
		@Body() updateCategoryDto: UpdateCategoryDto
	) {
		/** filter client data and remove unwanted data */
		const filteredData = plainToClass(UpdateCategoryDto, updateCategoryDto, {
			excludeExtraneousValues: true,
		});

		return this.categoryService.update(id, filteredData, image);
	}

	/**
	 * remove a category
	 * @param id - category's id number
	 */
	@Delete(":id")
	remove(@Param("id", ParseIntPipe) id: number) {
		return this.categoryService.remove(id);
	}
}
