import { BaseEntity } from "src/common/abstracts/base.entity";
import { Column, Entity, OneToOne } from "typeorm";
import { EntityName } from "src/common/enums/entity-name.enum";
import { UserEntity } from "./user.entity";

@Entity(EntityName.OTP)
export class OtpEntity extends BaseEntity {
	@Column()
	code: string;
	@Column()
	expires_in: Date;
	@Column({ nullable: true })
	method: string;
	@Column()
	userId: number;
	@OneToOne(() => UserEntity, (user) => user.otp, { onDelete: "CASCADE" })
	user: UserEntity;
}
