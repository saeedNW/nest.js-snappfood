import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
} from "@nestjs/common";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { MenuTypeService } from "../service/type.service";
import { SupplierAuthDecorator } from "src/common/decorators/auth.decorator";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";
import { MenuTypeDto } from "../dto/menu-type.dto";
import { plainToClass } from "class-transformer";

@Controller("menu-type")
@ApiTags("menu-type")
@SupplierAuthDecorator()
export class MenuTypeController {
	constructor(private readonly menuTypeService: MenuTypeService) {}

	/**
	 * Creates a new menu type.
	 * @param {MenuTypeDto} typeDto - The DTO containing menu type details.
	 */
	@Post()
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	create(@Body() typeDto: MenuTypeDto) {
		/** filter client data and remove unwanted data */
		const filteredData = plainToClass(MenuTypeDto, typeDto, {
			excludeExtraneousValues: true,
		});

		return this.menuTypeService.create(filteredData);
	}

	/**
	 * Retrieves all menu types from the database.
	 */
	@Get()
	findAll() {
		return this.menuTypeService.findAll();
	}

	/**
	 * Retrieves a specific menu type by its ID.
	 * @param {number} id - The ID of the menu type to retrieve.
	 */
	@Get("/:id")
	findOne(@Param("id", ParseIntPipe) id: number) {
		return this.menuTypeService.findOneById(id);
	}

	/**
	 * Deletes a menu type by its ID.
	 * @param {number} id - The ID of the menu type to delete.
	 */
	@Delete("/:id")
	delete(@Param("id", ParseIntPipe) id: number) {
		return this.menuTypeService.remove(id);
	}

	/**
	 * Updates a specific menu type by its ID
	 * @param {number} id - The ID of the menu type to update.
	 * @param {MenuTypeDto} typeDto - The DTO containing updated menu type details.
	 */
	@Put("/:id")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	update(@Param("id", ParseIntPipe) id: number, @Body() typeDto: MenuTypeDto) {
		/** filter client data and remove unwanted data */
		const filteredData = plainToClass(MenuTypeDto, typeDto, {
			excludeExtraneousValues: true,
		});

		return this.menuTypeService.update(id, filteredData);
	}
}
