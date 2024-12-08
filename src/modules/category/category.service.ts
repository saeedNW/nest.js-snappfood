import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CategoryEntity } from "./entities/category.entity";
import { DeepPartial, Repository } from "typeorm";
import { StorageService } from "../storage/storage.service";
import { toBoolean, isBoolean } from "src/common/utils/functions.utils";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { paginate, PaginatedResult } from "src/common/utils/pagination.utils";
import { EntityName } from "src/common/enums/entity-name.enum";

@Injectable()
export class CategoryService {
	constructor(
		@InjectRepository(CategoryEntity)
		private categoryRepository: Repository<CategoryEntity>,

		private storageService: StorageService
	) {}

	/**
	 * create new category
	 * @param createCategoryDto - category data
	 * @param image - uploaded image
	 */
	async create(
		createCategoryDto: CreateCategoryDto,
		image: Express.Multer.File
	) {
		/** Upload file to cloud storage */
		const { Location, Key } = await this.storageService.uploadFile(
			image,
			"snappfood-image"
		);

		/** Extract category data */
		let { title, slug, parentId, show } = createCategoryDto;

		/** Check for category conflict */
		const category = await this.findOneBySlug(slug);
		if (category) throw new ConflictException("Category already exist");

		/** Find and get the parent data */
		let parent: CategoryEntity = null;
		if (parentId && !isNaN(parentId)) {
			parent = await this.findOneById(+parentId);
		}

		/** Convert show to a valid boolean */
		if (isBoolean(show)) {
			show = toBoolean(show);
		} else {
			show = false;
		}

		/** Insert category's data to database */
		await this.categoryRepository.insert({
			title,
			slug,
			show,
			image: Location,
			imageKey: Key,
			parentId: parent?.id,
		});

		return "Created Category successfully";
	}

	/**
	 * Retrieve all categories
	 * @param paginationDto - pagination related data
	 */
	async findAll(
		paginationDto: PaginationDto
	): Promise<PaginatedResult<CategoryEntity>> {
		/** Generate database query */
		const queryBuilder = this.categoryRepository
			.createQueryBuilder(EntityName.CATEGORY)
			.leftJoin("category.parent", "parent")
			.addSelect(["parent.title"]);

		return await paginate(
			paginationDto,
			this.categoryRepository,
			queryBuilder,
			process.env.SERVER_LINK + "/category"
		);
	}

	/**
	 * Update category data
	 * @param id - category id number
	 * @param updateCategoryDto - new data to be updated
	 * @param image - category new image
	 */
	async update(
		id: number,
		updateCategoryDto: UpdateCategoryDto,
		image: Express.Multer.File
	) {
		/** Extract category data */
		const { parentId, show, slug, title } = updateCategoryDto;

		/** Check for category existence */
		const category = await this.findOneById(id);

		/** create a partial version of the category entity */
		const updateObject: DeepPartial<CategoryEntity> = {};

		if (image) {
			/** Upload file to cloud storage */
			const { Location, Key } = await this.storageService.uploadFile(
				image,
				"snappfood-image"
			);

			/** Update category image and image key */
			updateObject["image"] = Location;
			updateObject["imageKey"] = Key;

			/** Remove category's old image file */
			if (category?.imageKey) {
				await this.storageService.deleteFile(category?.imageKey);
			}
		}

		/** Update title and show status if provided */
		if (title) updateObject["title"] = title;
		if (show && isBoolean(show)) updateObject["show"] = toBoolean(show);

		/** Update category's parent */
		if (parentId && !isNaN(parseInt(parentId.toString()))) {
			const category = await this.findOneById(+parentId);
			updateObject["parentId"] = category.id;
		}

		/** Update category's slug value */
		if (slug) {
			const category = await this.findOneBySlug(slug);
			if (category && category.id !== id) {
				throw new ConflictException("already exist category slug");
			}
			updateObject["slug"] = slug;
		}

		/** Update category in database */
		await this.categoryRepository.update({ id }, updateObject);

		return "updated successfully";
	}

	remove(id: number) {
		return `This action removes a #${id} category`;
	}

	/**
	 * retrieve single category by id
	 * @param {number} id - category's id
	 */
	async findOneById(id: number) {
		const category = await this.categoryRepository.findOneBy({ id });
		if (!category) throw new NotFoundException("category not found");
		return category;
	}

	/**
	 * retrieve single category by slug
	 * @param {string} slug - category's slug
	 */
	async findOneBySlug(slug: string) {
		return await this.categoryRepository.findOneBy({ slug });
	}
}
