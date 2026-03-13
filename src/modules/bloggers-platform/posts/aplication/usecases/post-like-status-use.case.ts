// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { PostLikesRepository } from '../../infrastructure/post-likes.repository';
// import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
// import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
// import { PostsRepository } from '../../infrastructure/posts.repository';
// import { PostLike } from '../../domain/post-like.entity';
// import { UsersExternalQueryRepository } from '../../../../user-accounts/infrastructure/external-query/users.external-query-repository';
//
// export class PostLikeStatusCommand {
//   constructor(
//     public readonly postId: string,
//     public readonly userId: string,
//     public readonly likeStatus: string,
//   ) {}
// }
//
// @CommandHandler(PostLikeStatusCommand)
// export class PostLikeStatusUseCase implements ICommandHandler<PostLikeStatusCommand> {
//   constructor(
//     private readonly postLikesRepository: PostLikesRepository,
//     private readonly postsRepository: PostsRepository,
//     private readonly usersExternalQueryRepository: UsersExternalQueryRepository,
//   ) {}
//
//   async execute(command: PostLikeStatusCommand): Promise<void> {
//     console.log('POST LIKE CONTROLLER');
//     const post = await this.postsRepository.findById(command.postId);
//     if (!post) {
//       throw new DomainException({
//         code: DomainExceptionCode.NotFound,
//         message: 'Post not found',
//       });
//     }
//     const user = await this.usersExternalQueryRepository.getByIdOrNotFoundFail(
//       command.userId,
//     );
//
//     const like = await this.postLikesRepository.find(
//       command.userId,
//       command.postId,
//     );
//
//     if (!like) {
//       const newLike = PostLike.createNew({
//         likeStatus: command.likeStatus,
//         postId: command.postId,
//         userId: command.userId,
//         userLogin: user.login,
//       });
//       post.updateLikeCount(command.likeStatus);
//       await this.postLikesRepository.create(newLike);
//     } else {
//       if (command.likeStatus === like.myStatus) {
//         return;
//       }
//       const oldStatus = like.myStatus;
//       like.updateLikeStatus(command.likeStatus);
//       post.updateLikeCount(command.likeStatus, oldStatus);
//
//       await this.postLikesRepository.update(like);
//     }
//     const newestLikes = await this.getNewestLikes(command.postId);
//     post.updateNewestLikes(newestLikes);
//     await this.postsRepository.save(post);
//     return;
//   }
//   async getNewestLikes(postId: string) {
//     const lastLikes = await this.postLikesRepository.findLastLikes(postId);
//
//     if (!lastLikes) return [];
//     return lastLikes.map((like) => {
//       return {
//         addedAt: like.addedAt.toISOString(),
//         userId: like.userId,
//         login: like.userLogin,
//       };
//     });
//   }
// }
