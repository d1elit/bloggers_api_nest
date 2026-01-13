import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/aplication/blogs.service';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog-entity';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { Post, PostSchema } from './posts/domain/post-entity';
import { PostsService } from './posts/aplication/posts.service';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { BlogsExternalQueryRepository } from './blogs/infrastructure/external-query/blogs.external-query-repository';
import { PostsController } from './posts/api/posts.controller';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { PostsExternalQueryRepository } from './posts/infrastructure/external-query/posts.external-query-repository';
import { CreateBlogUseCase } from './blogs/aplication/usecases/create-blog.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateBlogUseCase } from './blogs/aplication/usecases/update-blog.usecase';
import { DeleteBlogUseCase } from './blogs/aplication/usecases/delete-blog.usecase';
import {
  GetBlogByIdQuery,
  GetBlogByIdQueryHandler,
} from './blogs/aplication/queries/get-blog-by-id.query-handler';
import { GetBlogsQueryHandler } from './blogs/aplication/queries/get-blogs.query-handler';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    BlogsExternalQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    PostsExternalQueryRepository,
    CreateBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,
    GetBlogByIdQueryHandler,
    GetBlogsQueryHandler,
  ],
  exports: [],
})
export class BloggersPlatformModule {}
