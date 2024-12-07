import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CategoryEntity } from "./entities/category.entity";
import { Repository } from "typeorm";
import { StorageService } from "../storage/storage.service";
import { toBoolean, isBoolean } from "src/common/utils/functions.utils";

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

	findAll() {
		return `This action returns all category`;
	}

	findOne(id: number) {
		return `This action returns a #${id} category`;
	}

	update(id: number, updateCategoryDto: UpdateCategoryDto) {
		return `This action updates a #${id} category`;
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
