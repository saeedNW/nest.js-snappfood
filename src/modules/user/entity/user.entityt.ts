import { BaseTimestampedEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { Column, Entity, OneToMany } from "typeorm";
import { AddressEntity } from "./address.entity";

@Entity(EntityName.USER)
export class UserEntity extends BaseTimestampedEntity {
	@Column({ nullable: true })
	firstName: string;
	@Column({ nullable: true })
	lastName: string;
	@Column({ unique: true })
	phone: string;
	@Column({ nullable: true, unique: true })
	email: string;
	@Column({ unique: true })
	inviteCode: string;
	@Column({ default: 0 })
	score: string;
	@Column({ default: 0 })
	reagent: string;
	@OneToMany(() => AddressEntity, (address) => address.user)
	address: AddressEntity[];
}