import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeEntity } from "../entity/type.entity";
import { Repository } from "typeorm";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { MenuTypeDto } from "../dto/menu-type.dto";

@Injectable({ scope: Scope.REQUEST })
export class MenuTypeService {
	constructor(
		@InjectRepository(TypeEntity)
		private typeRepository: Repository<TypeEntity>,

		@Inject(REQUEST) private req: Request
	) {}

	/**
	 * Creates a new menu type.
	 * @param {MenuTypeDto} createDto - The DTO with menu type details.
	 */
	async create(createDto: MenuTypeDto) {
		/** Extract the supplier ID from the request user */
		const { id } = this.req.user;

		/** Create a new menu type entity */
		const type = this.typeRepository.create({
			title: createDto.title,
			priority: createDto.priority,
			supplierId: id,
		});

		/** Save the entity to the database */
		await this.typeRepository.save(type);

		return "Type created successfully";
	}

	/**
	 * Retrieves all menu types for the current supplier.
	 */
	async findAll() {
		/** Extract the supplier ID from the request user */
		const { id } = this.req.user;

		return await this.typeRepository.find({
			where: { supplierId: id },
			order: { id: "DESC" },
		});
	}

	/**
	 * Retrieves a menu type by its ID.
	 * @param {number} id - The ID of the menu type to retrieve.
	 */
	async findOneById(id: number) {
		/** Extract the supplier ID from the request user */
		const { id: supplierId } = this.req.user;

		/** Find the menu type */
		const type = await this.typeRepository.findOneBy({ id, supplierId });

		if (!type) throw new NotFoundException("type not found");

		return type;
	}

	/**
	 * Deletes a menu type by its ID.
	 * @param {number} id - The ID of the menu type to delete.
	 */
	async remove(id: number) {
		/** Verify that the menu type exists */
		await this.findOneById(id);

		/** Delete the menu type */
		await this.typeRepository.delete({ id });

		return "deleted successfully";
	}

	/**
	 * Updates a menu type by its ID.
	 * @param {number} id - The ID of the menu type to update.
	 * @param {MenuTypeDto} typeDto - The DTO with updated menu type details.
	 */
	async update(id: number, typeDto: MenuTypeDto) {
		/** Verify that the menu type exists */
		let type = await this.findOneById(id);

		/** Update the entity with new values */
		const { title, priority } = typeDto;

		/** Update title if provided */
		if (title) type.title = title;
		/** Update priority if provided */
		if (priority) type.priority = priority;

		/** Save the updated entity to the database */
		await this.typeRepository.save(type);

		return "updated successfully";
	}
}
