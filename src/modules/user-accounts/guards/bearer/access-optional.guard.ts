import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../../application/jwt.service';
import { CommentLikesRepository } from '../../../bloggers-platform/comments/infrastructure/comment-likes.repository';
import { OptionalUserContext } from '../types.d';

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
      request.user = { likeStatus: 'None', userId: null } as OptionalUserContext;
      return true;
    }

    const [authType, token] = authHeader.split(' ');
    if (authType !== 'Bearer' || !token) {
      request.user = { likeStatus: 'None', userId: null } as OptionalUserContext;
      return true;
    }

    try {
      const payload = await this.jwtService.verifyToken(token);
      if (!payload) {
        request.user = { likeStatus: 'None', userId: null } as OptionalUserContext;
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

      request.user = { userId, likeStatus } as OptionalUserContext;
    } catch (error) {
      // If token is invalid or expired, we treat the user as anonymous.
      request.user = { likeStatus: 'None', userId: null } as OptionalUserContext;
    }

    return true;
  }
}
