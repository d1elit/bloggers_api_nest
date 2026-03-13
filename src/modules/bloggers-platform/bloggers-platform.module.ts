import { Module } from '@nestjs/common';
import { SaBlogsController } from './blogs/api/sa-blogs.controller';
import { BlogsService } from './blogs/aplication/blogs.service';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
// import { Blog, BlogSchema } from './blogs/domain/blog-mongo.entity';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { BlogsExternalQueryRepository } from './blogs/infrastructure/external-query/blogs.external-query-repository';
import { SaPostsController } from './posts/api/sa-posts.controller';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { PostsExternalQueryRepository } from './posts/infrastructure/external-query/posts.external-query-repository';
import { CreateBlogUseCase } from './blogs/aplication/usecases/create-blog.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateBlogUseCase } from './blogs/aplication/usecases/update-blog.usecase';
import { DeleteBlogUseCase } from './blogs/aplication/usecases/delete-blog.usecase';
import { GetBlogByIdQueryHandler } from './blogs/aplication/queries/get-blog-by-id.query-handler';
import { GetBlogsQueryHandler } from './blogs/aplication/queries/get-blogs.query-handler';
import { CreatePostUseCase } from './posts/aplication/usecases/create-post.usecase';
import { UpdatePostUseCase } from './posts/aplication/usecases/update-post.usecase';
import { DeletePostUseCase } from './posts/aplication/usecases/delete-post.usecase';
import { GetPostByIdQueryHandler } from './posts/aplication/queries/get-post-by-id.query-handler';
import { GetPostsQueryHandler } from './posts/aplication/queries/get-posts.query-handler';
import { PublicCommentsController } from './comments/api/public-comments.controller';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment.usecase';
import { UpdateLikeStatusUseCase } from './comments/application/usecases/update-like-status.usecase';
import { GetCommentByIdQueryHandler } from './comments/application/queries/get-comment-by-id.query-handler';
import { GetPostsCommentQueryHandler } from './comments/application/queries/get-comments-for-post.query-handler';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { CommentLikesRepository } from './comments/infrastructure/comment-likes.repository';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';

import { UserAccountsModule } from '../user-accounts/user-accounts.module';

import { PostLikesRepository } from './posts/infrastructure/post-likes.repository';
import { PostLikeStatusUseCase } from './posts/aplication/usecases/post-like-status-use.case';
import { PublicBlogsController } from './blogs/api/public-blogs.controller';
import { PublicPostsController } from './posts/api/public-posts.controller';

@Module({
  imports: [CqrsModule, UserAccountsModule],
  controllers: [
    SaBlogsController,
    SaPostsController,
    PublicCommentsController,
    PublicBlogsController,
    PublicPostsController,
  ],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    BlogsExternalQueryRepository,
    PostsRepository,
    PostLikesRepository,
    PostsQueryRepository,
    PostsExternalQueryRepository,
    CommentsRepository,
    CommentLikesRepository,
    CommentsQueryRepository,
    CreateBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,
    GetBlogByIdQueryHandler,
    GetBlogsQueryHandler,
    CreatePostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    PostLikeStatusUseCase,
    GetPostByIdQueryHandler,
    GetPostsQueryHandler,
    CreateCommentUseCase,
    UpdateCommentUseCase,
    DeleteCommentUseCase,
    UpdateLikeStatusUseCase,
    GetCommentByIdQueryHandler,
    GetPostsCommentQueryHandler,
  ],
  exports: [],
})
export class BloggersPlatformModule {}
