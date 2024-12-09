import { HttpModule } from "@nestjs/axios";
import { Global, Module } from "@nestjs/common";
import { SmsIrService } from "./sms-ir.service";

@Global()
@Module({
	imports: [
		/** Register timeout for requested come to the module */
		HttpModule.register({
			timeout: 10000,
		}),
	],
	providers: [SmsIrService],
	exports: [SmsIrService],
})
export class CustomHttpModule {}
