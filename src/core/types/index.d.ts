import { UserContextDto } from '../../dto/user-context.dto';

declare global {
  namespace Express {
    interface Request {
      user?: UserContextDto;
    }
  }
}

export {};
