import { User as IUser } from "../models/User";

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export {};
