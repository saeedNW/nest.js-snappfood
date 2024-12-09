import { BaseTimestampedEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { CategoryEntity } from "src/modules/category/entities/category.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

@Entity(EntityName.SUPPLIER)
export class SupplierEntity extends BaseTimestampedEntity {
	@Column()
	phone: string;
	@Column({ nullable: true, default: false })
	verify_phone: boolean;
	@Column()
	managerName: string;
	@Column()
	managerFamily: string;
	@Column()
	storeName: string;
	@Column({ nullable: true })
	categoryId: number;
	@ManyToOne(() => CategoryEntity, (category) => category.suppliers, {
		onDelete: "SET NULL",
	})
	category: CategoryEntity;
	@Column()
	city: string;
	@Column({ unique: true, nullable: true })
	inviteCode: string;
	@Column({ nullable: true })
	reagent: string;
	@OneToMany(() => SupplierEntity, (supplier) => supplier.reagent)
	subsets: SupplierEntity[];
}
