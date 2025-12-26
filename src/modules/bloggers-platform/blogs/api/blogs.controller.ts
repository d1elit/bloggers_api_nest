import { Controller, Get } from '@nestjs/common';
import { BlogsService } from '../aplication/blogs.service';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  getBlog() {
    return { blog1: 'hi', blog2: 'hi2', blog3: 'hi3' };
  }
}
