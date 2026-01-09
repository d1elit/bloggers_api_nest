import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserContextDto } from '../../dto/user-context.dto';

interface RequestWithUser extends Request {
  user?: UserContextDto;
}

export const ExtractUserIfExistsFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserContextDto | null => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user: UserContextDto | undefined = request.user;

    if (!user) {
      return null;
    }

    return user;
  },
);
