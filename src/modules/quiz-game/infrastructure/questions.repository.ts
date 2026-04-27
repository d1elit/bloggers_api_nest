import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Question } from '../domain/question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private questionsRepo: Repository<Question>,
  ) {}

  async save(question: Question) {
    return this.questionsRepo.save(question);
  }

  async findById(id: string): Promise<Question | null> {
    return await this.questionsRepo.findOneBy({ id });
  }
  async findOrNotFoundFail(id: string): Promise<Question> {
    const question = await this.findById(id);
    if (!question) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'question',
            message: 'Question not found',
          },
        ],
      });
    }
    return question;
  }
}
