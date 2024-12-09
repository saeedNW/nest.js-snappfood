import { BaseEntity } from "src/common/abstracts/base.entity";
import { Column, Entity, OneToOne } from "typeorm";
import { EntityName } from "src/common/enums/entity-name.enum";
import { SupplierEntity } from "./supplier.entity";

@Entity(EntityName.SUPPLIER_OTP)
export class SupplierOtpEntity extends BaseEntity {
	@Column()
	code: string;
	@Column()
	expires_in: Date;
	@Column({ nullable: true })
	method: string;
	@Column()
	supplierId: number;
	@OneToOne(() => SupplierEntity, (supplier) => supplier.otp, {
		onDelete: "CASCADE",
	})
	supplier: SupplierEntity;
}
