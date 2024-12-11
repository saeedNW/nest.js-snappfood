import { SupplierEntity } from "src/modules/supplier/entities/supplier.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { MenuEntity } from "./menu.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";

@Entity(EntityName.MENU_TYPE)
export class TypeEntity extends BaseEntity {
	@Column()
	title: string;
	@Column({ default: 0 })
	priority: number;
	@Column()
	supplierId: number;
	@OneToMany(() => MenuEntity, (food) => food.type)
	items: MenuEntity[];
	@ManyToOne(() => SupplierEntity, (supplier) => supplier.menuTypes, {
		onDelete: "CASCADE",
	})
	supplier: SupplierEntity;
}
