import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { MenuEntity } from "../entity/menu.entity";
import { Repository } from "typeorm";
import { TypeEntity } from "../entity/type.entity";
import { MenuTypeService } from "./type.service";
import { StorageService } from "src/modules/storage/storage.service";
import { CreateFoodDto } from "../dto/create-food.dto";
import { Request } from "express";
import { UpdateFoodDto } from "../dto/update-food.dto";

@Injectable({ scope: Scope.REQUEST })
export class MenuService {
	constructor(
		/** make the current request accessible in service  */
		@Inject(REQUEST)
		private request: Request,

		/** Register menu repository */
		@InjectRepository(MenuEntity)
		private menuRepository: Repository<MenuEntity>,

		/** Register type repository */
		@InjectRepository(TypeEntity)
		private menuTypeRepository: Repository<TypeEntity>,

		/** Register menu type service */
		private typeService: MenuTypeService,

		/** Register cloud storage service */
		private storageService: StorageService
	) {}

	/**
	 * Creates a new menu item in the database.
	 * @param {CreateFoodDto} foodDto - The DTO containing details of the food item.
	 * @param {Express.Multer.File} image - The image file to upload.
	 */
	async create(foodDto: CreateFoodDto, image: Express.Multer.File) {
		/** Extract supplier ID from the current user session */
		const { id: supplierId } = this.request.user;

		/** Destructure the foodDto properties */
		const { name, description, discount, price, typeId } = foodDto;

		/** Validate the menu type existence */
		const type = await this.typeService.findOneById(typeId);

		/** Upload the image to storage and get its location and key */
		const { Location, Key } = await this.storageService.uploadFile(
			image,
			"menu-item"
		);

		/** Create a new menu item entity */
		const item = this.menuRepository.create({
			name,
			description,
			discount,
			price,
			typeId: type.id,
			supplierId,
			image: Location,
			key: Key,
		});

		/** Save the entity to the database */
		await this.menuRepository.save(item);

		return "Created";
	}

	/**
	 * Retrieves all menu items for a specific supplier.
	 * @param {number} supplierId - The ID of the supplier.
	 */
	async findAll(supplierId: number) {
		return await this.menuTypeRepository.find({
			where: { supplierId },
			relations: {
				items: true,
			},
		});
	}

	/**
	 * Checks if a menu item exists for the current supplier.
	 * @param {number} id - The ID of the menu item.
	 * @throws {NotFoundException} If the menu item does not exist.
	 */
	async checkExist(id: number) {
		/** Extract supplier ID from the current user session */
		const { id: supplierId } = this.request.user;

		/** Find the menu item */
		const item = await this.menuRepository.findOneBy({ id, supplierId });

		if (!item) throw new NotFoundException();

		return item;
	}

	/**
	 * Retrieves a menu item by its ID for the current supplier.
	 * @param {number} id - The ID of the menu item.
	 * @throws {NotFoundException} If the menu item does not exist.
	 */
	async findOne(id: number) {
		/** Extract supplier ID from the current user session */
		const { id: supplierId } = this.request.user;

		/** Find the menu item with related entities */
		const item = await this.menuRepository.findOne({
			where: { id, supplierId },
			relations: {
				type: true,
				feedbacks: {
					user: true,
				},
			},
			select: {
				type: {
					title: true,
				},
				feedbacks: {
					comment: true,
					created_at: true,
					user: {
						firstName: true,
						lastName: true,
					},
					score: true,
				},
			},
		});

		if (!item) throw new NotFoundException();

		return item;
	}

	/**
	 * Retrieves a menu item by its ID regardless of the supplier.
	 * @param {number} id - The ID of the menu item.
	 * @throws {NotFoundException} If the menu item does not exist.
	 */
	async getOne(id: number) {
		const item = await this.menuRepository.findOne({
			where: { id },
		});

		if (!item) throw new NotFoundException();

		return item;
	}

	/**
	 * Deletes a menu item by its ID.
	 * @param {number} id - The ID of the menu item to delete.
	 */
	async delete(id: number) {
		/** Ensure the menu item exists before deleting */
		await this.findOne(id);

		/** Perform the deletion */
		await this.menuRepository.delete({ id });
		return "deleted";
	}
}
