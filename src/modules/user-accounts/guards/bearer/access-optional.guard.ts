import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../../application/jwt.service';
import { CommentLikesRepository } from '../../../bloggers-platform/comments/infrastructure/comment-likes.repository';

// This context allows userId to be optional for anonymous users.
interface UserContext {
  userId?: string | null;
  likeStatus?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserContext;
    }
  }
}

@Injectable()
export class AccessOptionalGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly commentLikesRepository: CommentLikesRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      request.user = { likeStatus: 'None', userId: null };
      return true;
    }

    const [authType, token] = authHeader.split(' ');
    if (authType !== 'Bearer' || !token) {
      request.user = { likeStatus: 'None', userId: null };
      return true;
    }

    try {
      const payload = await this.jwtService.verifyToken(token);
      if (!payload) {
        request.user = { likeStatus: 'None', userId: null };
        return true;
      }

      const { userId } = payload;
      const entityId = request.params.id;
      let likeStatus = 'None';

      if (request.originalUrl.includes('/comments/') && entityId) {
        const like = await this.commentLikesRepository.find(userId, entityId);
        if (like) {
          likeStatus = like.myStatus;
        }
      }

      // TODO: Implement post like status check when PostLikesRepository is available.
      // The original middleware referenced a PostLikesRepository, which is not found in the current project structure.
      // if (request.originalUrl.includes('/posts/') && entityId) { ... }

      request.user = { userId, likeStatus };
    } catch (error) {
      // If token is invalid or expired, we treat the user as anonymous.
      request.user = { likeStatus: 'None', userId: null };
    }

    return true;
  }
}
