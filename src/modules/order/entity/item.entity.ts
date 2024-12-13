import { Column, Entity, ManyToOne } from "typeorm";
import { OrderEntity } from "./order.entity";
import { SupplierEntity } from "src/modules/supplier/entities/supplier.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { OrderItemStatus } from "../enum/order-item.status";
import { MenuEntity } from "src/modules/menu/entity/menu.entity";

@Entity(EntityName.ORDER_ITEM)
export class OrderItemEntity extends BaseEntity {
	@Column()
	foodId: number;
	@Column()
	count: number;
	@Column()
	supplierId: number;
	@Column({
		type: "enum",
		enum: OrderItemStatus,
		default: OrderItemStatus.PENDING,
	})
	status: string;
	@Column()
	orderId: number;
	@ManyToOne(() => OrderEntity, (order) => order.items, {
		onDelete: "CASCADE",
	})
	order: OrderEntity;
	@ManyToOne(() => MenuEntity, (menu) => menu.orders, { onDelete: "CASCADE" })
	food: MenuEntity;
	@ManyToOne(() => SupplierEntity, (supplier) => supplier.orders, {
		onDelete: "CASCADE",
	})
	supplier: SupplierEntity;
}
