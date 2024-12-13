import { BaseTimestampedEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { CategoryEntity } from "src/modules/category/entities/category.entity";
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	OneToOne,
} from "typeorm";
import { SupplierOtpEntity } from "./supplier-otp.entity";
import { SupplierStatus } from "../enum/status.enum";
import { MenuEntity } from "src/modules/menu/entity/menu.entity";
import { TypeEntity } from "src/modules/menu/entity/type.entity";
import { OrderItemEntity } from "src/modules/order/entity/item.entity";

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
	@Column({ nullable: true, default: SupplierStatus.REGISTERED })
	status: string;
	@Column({ nullable: true })
	email: string;
	@Column({ nullable: true })
	nationalCode: string;
	@Column()
	city: string;
	@Column({ unique: true, nullable: true })
	inviteCode: string;
	@Column({ nullable: true })
	image: string;
	@Column({ nullable: true })
	document: string;
	@Column({ nullable: true })
	reagentId: number;
	@Column({ nullable: true })
	categoryId: number;
	@ManyToOne(() => SupplierEntity, (supplier) => supplier.subsets)
	reagent: SupplierEntity;
	@OneToMany(() => SupplierEntity, (supplier) => supplier.reagent)
	subsets: SupplierEntity[];
	@OneToMany(() => MenuEntity, (food) => food.supplier)
	menu: MenuEntity[];
	@OneToMany(() => TypeEntity, (type) => type.supplier)
	menuTypes: TypeEntity[];
	@ManyToOne(() => CategoryEntity, (category) => category.suppliers, {
		onDelete: "SET NULL",
	})
	category: CategoryEntity;
	@OneToMany(() => OrderItemEntity, (food) => food.supplier)
	orders: OrderItemEntity[];
	@Column({ nullable: true })
	otpId: number;
	@OneToOne(() => SupplierOtpEntity, (otp) => otp.supplier, { nullable: true })
	@JoinColumn()
	otp: SupplierOtpEntity;
}
