import { BaseTimestampedEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { UserEntity } from "src/modules/user/entity/user.entityt";
import { Column, Entity, ManyToOne } from "typeorm";
import { MenuEntity } from "./menu.entity";

@Entity(EntityName.FEEDBACK)
export class FeedbackEntity extends BaseTimestampedEntity {
	@Column()
	userId: number;
	@Column()
	foodId: number;
	@Column()
	score: number;
	@Column()
	comment: string;
	@ManyToOne(() => UserEntity, (user) => user.feedbacks, {
		onDelete: "CASCADE",
	})
	user: UserEntity;
	@ManyToOne(() => MenuEntity, (food) => food.feedbacks, {
		onDelete: "CASCADE",
	})
	food: MenuEntity;
}
