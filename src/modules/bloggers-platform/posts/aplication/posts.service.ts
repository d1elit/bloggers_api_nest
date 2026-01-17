import { InjectModel } from '@nestjs/mongoose';

import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { Post, type PostModelType } from '../domain/post-entity';
import { CreatePostDto, UpdatePostDto } from '../dto/create-post.dto';
import { BlogsExternalQueryRepository } from '../../blogs/infrastructure/external-query/blogs.external-query-repository';
import { PostLikesRepository } from '../infrastructure/post-likes.repository';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { PostLike } from '../domain/post-like.entity';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly postLikesRepository: PostLikesRepository, // Injected
    private readonly usersRepository: UsersRepository, // Injected
    @InjectModel(Post.name)
    private postModel: PostModelType,
    private readonly blogExternalQueryRepository: BlogsExternalQueryRepository,
  ) {}

  async create(postDto: CreatePostDto, blogIdDto?: string): Promise<string> {
    const blogId = blogIdDto ? blogIdDto : postDto.blogId;
    const blog =
      await this.blogExternalQueryRepository.getByIdOrNotFoundFail(blogId);
    const post = this.postModel.createInstance(postDto, blog);
    console.log(post);
    await this.postsRepository.save(post);
    return post._id.toString();
  }
  async update(id: string, postDto: UpdatePostDto) {
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.update(postDto);
    return await this.postsRepository.save(post);
  }
  async delete(id: string): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.makeDeleted();
    this.postsRepository.save(post);
  }
  // async postLike(
  //   likeStatus: string,
  //   postId: string,
  //   userId: string,
  // ): Promise<void> {
  //   const post = await this.postsRepository.findById(postId);
  //   if (!post) throw new NotFoundException('Post not found');
  //
  //   const user = await this.usersRepository.findById(userId);
  //   if (!user) throw new NotFoundException('User not found');
  //
  //   const like = await this.postLikesRepository.find(userId, postId);
  //
  //   if (like === null) {
  //     const newLike = PostLike.createNew({
  //       postId: postId,
  //       userId: userId,
  //       userLogin: user.login, // Correct path to login
  //       likeStatus,
  //     });
  //
  //     post.updateLikeCount(likeStatus);
  //     await this.postLikesRepository.create(newLike);
  //   } else {
  //     if (likeStatus === like.myStatus) {
  //       return;
  //     }
  //     const oldStatus = like.myStatus;
  //     like.updateLikeStatus(likeStatus);
  //     post.updateLikeCount(likeStatus, oldStatus);
  //
  //     await this.postLikesRepository.update(like);
  //   }
  //
  //   const newestLikes = await this.getNewestLikes(postId);
  //   post.updateNewestLikes(newestLikes);
  //   await this.postsRepository.save(post);
  // }
  //
  // async getNewestLikes(postId: string) {
  //   const lastLikes = await this.postLikesRepository.findLastLikes(postId);
  //
  //   if (!lastLikes) return [];
  //   return lastLikes.map((like) => {
  //     return {
  //       addedAt: like.addedAt.toISOString(),
  //       userId: like.userId,
  //       login: like.userLogin,
  //     };
  //   });
  // }
}
