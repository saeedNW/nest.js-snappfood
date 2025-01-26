import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export function TypeOrmConfig(): TypeOrmModuleOptions {
	/** retrieve database data from ENVs */
	const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME } = process.env;

	return {
		type: "mysql",
		port: 3306,
		host: "node_mysql",
		username: "root",
		password: "root",
		database: "snappfood",
		autoLoadEntities: true,
		synchronize: true,
	};
}
