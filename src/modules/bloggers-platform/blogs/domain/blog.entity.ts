import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';
import { randomUUID } from 'crypto';
import { Post } from '../../posts/domain/post.entity';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', collation: 'C' })
  public name: string;

  @Column({ type: 'varchar', collation: 'C' })
  public description: string;

  @Column({ type: 'varchar', name: 'website_url', collation: 'C' })
  public websiteUrl: string;

  @Column({ type: 'timestamp without time zone', name: 'created_at' })
  public createdAt: Date;

  @Column({ type: 'boolean', name: 'is_membership', default: false })
  public isMembership: boolean;

  @DeleteDateColumn({
    type: 'timestamp without time zone',
    nullable: true,
    name: 'deleted_at',
  })
  public deletedAt: Date | null;

  @OneToMany(() => Post, (post) => post.blog)
  public posts: Post[];

  static createInstance(dto: CreateBlogDomainDto): Blog {
    const blog = new Blog();
    blog.id = randomUUID();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.createdAt = new Date();
    blog.isMembership = false;
    blog.deletedAt = null;

    return blog;
  }

  update(dto: CreateBlogDomainDto): void {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  makeDeleted(): void {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }
}
