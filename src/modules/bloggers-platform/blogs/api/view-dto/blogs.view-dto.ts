import { BlogsMapper } from '../../infrastructure/blogs-mapper';

export class BlogViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  static mapToView(blogRow: any): BlogViewDto {
    const blogDomain = BlogsMapper.toDomain(blogRow);
    const dto = new BlogViewDto();
    dto.id = blogDomain.id;
    dto.name = blogDomain.name;
    dto.description = blogDomain.description;
    dto.websiteUrl = blogDomain.websiteUrl;
    dto.isMembership = blogDomain.isMembership;
    dto.createdAt = blogDomain.createdAt.toISOString();
    return dto;
  }
}
