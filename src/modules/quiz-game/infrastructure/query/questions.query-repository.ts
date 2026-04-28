import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../../domain/question.entity';
import { Repository } from 'typeorm';
import { GetQuestionsQueryParams } from '../../api/input-dto/get-questions-query-params';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private questionsRepo: Repository<Question>,
  ) {}

  async getAll(query: GetQuestionsQueryParams) {
    const queryBuilder = this.questionsRepo.createQueryBuilder('q');

    queryBuilder.select([
      'id',
      'body',
      'correct_answers as "correctAnswers"',
      'published',
      'created_at as "createdAt" ',
      'updated_at as "updatedAt"',
    ]);
    if (query.bodySearchTerm) {
      queryBuilder.orWhere('q.body ILIKE :body', {
        body: `%${query.bodySearchTerm}%`,
      });
    }
    if (query.publishedStatus === 'published') {
      queryBuilder.andWhere('q.published = :published', {
        published: true,
      });
    }

    if (query.publishedStatus === 'notPublished') {
      queryBuilder.andWhere('q.published = :published', {
        published: false,
      });
    }

    queryBuilder.skip(query.calculateSkip()).take(query.pageSize);

    queryBuilder.orderBy('q.createdAt', 'DESC');

    const sortField = query.sortBy || 'createdAt';

    const sortDirection =
      query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder.orderBy(`q.${sortField}`, sortDirection);

    const items = await queryBuilder.getRawMany();

    const totalCount = await queryBuilder.getCount();

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: 1,
      size: 1,
    });
  }
}
