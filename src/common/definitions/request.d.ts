import { IUser } from "src/modules/user/interface/user-request.interface";

/** Declare a global module augmentation */
declare global {
	/** Extend the Express namespace */
	namespace Express {
		/** Extend the Request interface within the Express namespace */
		interface Request {
			/** Add an optional `user` property of type `IUser` to the Request interface */
			user?: IUser;
		}
	}
}
