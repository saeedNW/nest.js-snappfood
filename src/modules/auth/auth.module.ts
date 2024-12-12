import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../user/entity/user.entity";
import { OtpEntity } from "../user/entity/otp.entity";
import { AuthController } from "./auth.controller";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { TokenService } from "./token.service";

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity, OtpEntity])],
	controllers: [AuthController],
	providers: [AuthService, JwtService, TokenService],
	exports: [AuthService, JwtService, TokenService, TypeOrmModule],
})
export class AuthModule {}
