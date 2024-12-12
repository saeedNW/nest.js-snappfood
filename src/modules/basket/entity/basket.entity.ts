import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { DiscountEntity } from "src/modules/discount/entities/discount.entity";
import { MenuEntity } from "src/modules/menu/entity/menu.entity";
import { UserEntity } from "src/modules/user/entity/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity(EntityName.USER_BASKET)
export class UserBasketEntity extends BaseEntity {
	@Column({ nullable: true })
	foodId: number;
	@Column()
	userId: number;
	@Column({ nullable: true })
	count: number;
	@Column({ nullable: true })
	discountId: number;
	@ManyToOne(() => MenuEntity, (food) => food.baskets, { onDelete: "CASCADE" })
	food: MenuEntity;
	@ManyToOne(() => UserEntity, (user) => user.basket, { onDelete: "CASCADE" })
	user: UserEntity;
	@ManyToOne(() => DiscountEntity, (discount) => discount.baskets, {
		onDelete: "CASCADE",
	})
	discount: DiscountEntity;
}
