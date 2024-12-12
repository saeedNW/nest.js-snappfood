import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { UserBasketEntity } from "src/modules/basket/entity/basket.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity(EntityName.DISCOUNT)
export class DiscountEntity extends BaseEntity {
	@Column()
	code: string;
	@Column({ type: "double", nullable: true })
	percent: number;
	@Column({ type: "double", nullable: true })
	amount: number;
	@Column({ nullable: true })
	expires_in: Date;
	@Column({ nullable: true })
	limit: number;
	@Column({ nullable: true, default: 0 })
	usage: number;
	@Column({ nullable: true })
	supplierId: number;
	@Column({ default: true })
	active: boolean;
	@OneToMany(() => UserBasketEntity, (basket) => basket.discount)
	baskets: UserBasketEntity[];
}
