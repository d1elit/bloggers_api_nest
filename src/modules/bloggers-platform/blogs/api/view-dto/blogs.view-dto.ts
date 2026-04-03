export class BlogViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;

  static mapToView(blogRow: any): BlogViewDto {
    const dto = new BlogViewDto();
    dto.id = blogRow.id;
    dto.name = blogRow.name;
    dto.description = blogRow.description;
    dto.websiteUrl = blogRow.websiteUrl;
    dto.isMembership = blogRow.isMembership;
    dto.createdAt = blogRow.createdAt;
    return dto;
  }
}
