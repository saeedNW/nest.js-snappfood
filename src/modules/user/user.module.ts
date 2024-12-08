import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entity/user.entityt";
import { OtpEntity } from "./entity/otp.entity";
import { AddressEntity } from "./entity/address.entity";

@Module({
	imports: [AuthModule, TypeOrmModule.forFeature([UserEntity, OtpEntity, AddressEntity])],
	controllers: [],
	providers: [],
	exports: [TypeOrmModule],
})
export class UserModule {}
