import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';
import { randomUUID } from 'crypto';

export class BlogDomain {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: Date,
    public isMembership: boolean,
    public deletedAt: Date | null,
  ) {}

  static createInstance(dto: CreateBlogDomainDto): BlogDomain {
    return new BlogDomain(
      randomUUID(),
      dto.name,
      dto.description,
      dto.websiteUrl,
      new Date(),
      false,
      null,
    );
  }

  update(dto: CreateBlogDomainDto): void {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }
}

export type BlogDocument = BlogDomain;
export type BlogModelType = never;
