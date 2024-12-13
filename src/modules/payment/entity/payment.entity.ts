import { BaseTimestampedEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { OrderEntity } from "src/modules/order/entity/order.entity";
import { UserEntity } from "src/modules/user/entity/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity(EntityName.PAYMENT)
export class PaymentEntity extends BaseTimestampedEntity {
	@Column({ default: false })
	status: boolean;
	@Column()
	amount: number;
	@Column()
	invoice_number: string;
	@Column({ nullable: true })
	authority: string;
	@Column()
	userId: number;
	@Column()
	orderId: number;
	@ManyToOne(() => OrderEntity, (order) => order.payments, {
		onDelete: "CASCADE",
	})
	order: OrderEntity;
	@ManyToOne(() => UserEntity, (user) => user.payments, {
		onDelete: "CASCADE",
	})
	user: UserEntity;
}
