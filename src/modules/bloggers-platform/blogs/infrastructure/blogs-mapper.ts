import { Blog } from '../domain/blog.entity';

export class BlogsMapper {
  static toDomain(row: any): Blog {
    return new Blog(
      row.id,
      row.name,
      row.description,
      row.website_url,
      row.created_at,
      row.is_membership,
      row.deleted_at,
    );
  }

  static toPersistence(blog: Blog) {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      website_url: blog.websiteUrl,
      created_at: blog.createdAt,
      is_membership: blog.isMembership,
      deleted_at: blog.deletedAt,
    };
  }
}
