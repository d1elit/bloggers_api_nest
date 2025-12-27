import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';

@Schema({ collection: 'blogs' })
export class Blog {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  websiteUrl!: string;

  @Prop({ required: true })
  createdAt!: string;

  @Prop({ required: true })
  isMembership!: boolean;

  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  static createInstance(
    this: BlogModelType,
    dto: CreateBlogDomainDto,
  ): BlogDocument {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.createdAt = new Date().toISOString();
    blog.isMembership = false;
    blog.deletedAt = null;
    return blog as BlogDocument;
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

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);

export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & typeof Blog;
