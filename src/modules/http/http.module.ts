import { HttpModule } from "@nestjs/axios";
import { Global, Module } from "@nestjs/common";
import { SmsIrService } from "./sms-ir.service";
import { ZarinpalService } from "./zarinpal.service";

@Global()
@Module({
	imports: [
		/** Register timeout for requested come to the module */
		HttpModule.register({
			maxRedirects: 5,
			timeout: 5000,
		}),
	],
	providers: [SmsIrService, ZarinpalService],
	exports: [SmsIrService, ZarinpalService],
})
export class CustomHttpModule {}
