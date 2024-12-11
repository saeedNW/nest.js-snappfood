import { BaseTimestampedEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { AddressEntity } from "./address.entity";
import { OtpEntity } from "./otp.entity";
import { FeedbackEntity } from "src/modules/menu/entity/feedback.entity";

@Entity(EntityName.USER)
export class UserEntity extends BaseTimestampedEntity {
	@Column({ nullable: true })
	firstName: string;
	@Column({ nullable: true })
	lastName: string;
	@Column({ unique: true })
	phone: string;
	@Column({ nullable: true, default: false })
	verify_phone: boolean;
	@Column({ nullable: true, unique: true })
	email: string;
	@Column({ unique: true, nullable: true })
	inviteCode: string;
	@Column({ default: 0 })
	score: string;
	@Column({ nullable: true })
	reagent: string;
	@OneToMany(() => AddressEntity, (address) => address.user)
	address: AddressEntity[];
	@OneToMany(() => FeedbackEntity, (feedback) => feedback.user)
	feedbacks: FeedbackEntity[];
	@Column({ nullable: true })
	otpId: number;
	@OneToOne(() => OtpEntity, (otp) => otp.user, { nullable: true })
	@JoinColumn()
	otp: OtpEntity;
}
