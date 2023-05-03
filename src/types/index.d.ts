import {Nullable} from '../types';
import {UserViewModel} from '../models/users/UserViewModel';

declare global {
    namespace Express {
        export interface Request {
            user: Nullable<UserViewModel>
        }
    }
}
