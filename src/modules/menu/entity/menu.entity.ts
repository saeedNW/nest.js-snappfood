import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { FeedbackEntity } from "./feedback.entity";
import { SupplierEntity } from "src/modules/supplier/entities/supplier.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { TypeEntity } from "./type.entity";
import { BaseEntity } from "src/common/abstracts/base.entity";

@Entity(EntityName.MENU)
export class MenuEntity extends BaseEntity {
	@Column()
	name: string;
	@Column()
	image: string;
	@Column()
	key: string;
	@Column({ type: "double" })
	price: number;
	@Column({ type: "double", default: 0 })
	discount: number;
	@Column({ default: false })
	is_active: boolean;
	@Column()
	description: string;
	@Column({ type: "double", default: 0 })
	score: number;
	@Column()
	typeId: number;
	@Column()
	supplierId: number;
	@OneToMany(() => FeedbackEntity, (feedback) => feedback.food)
	feedbacks: FeedbackEntity[];
	@ManyToOne(() => TypeEntity, (type) => type.items)
	type: TypeEntity;
	@ManyToOne(() => SupplierEntity, (supplier) => supplier.menu, {
		onDelete: "CASCADE",
	})
	supplier: SupplierEntity;
}
