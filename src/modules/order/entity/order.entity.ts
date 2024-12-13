import { BaseTimestampedEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { AddressEntity } from "src/modules/user/entity/address.entity";
import { UserEntity } from "src/modules/user/entity/user.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { OrderStatus } from "../enum/order-status.enum";
import { OrderItemEntity } from "./item.entity";
import { PaymentEntity } from "src/modules/payment/entity/payment.entity";

@Entity(EntityName.ORDER)
export class OrderEntity extends BaseTimestampedEntity {
	@Column()
	userId: number;
	@ManyToOne(() => UserEntity, (user) => user.orders, { onDelete: "CASCADE" })
	user: UserEntity;
	@Column({ nullable: true })
	addressId: number;
	@ManyToOne(() => AddressEntity, (address) => address.orders, {
		onDelete: "SET NULL",
	})
	address: AddressEntity;
	@Column()
	payment_amount: number;
	@Column()
	discount_amount: number;
	@Column()
	total_amount: number;
	@Column({ nullable: true })
	description: string;
	@Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING })
	status: string;
	@OneToMany(() => OrderItemEntity, (item) => item.order)
	items: OrderItemEntity[];
	@OneToMany(() => PaymentEntity, (payment) => payment.order)
	payments: PaymentEntity[];
}
