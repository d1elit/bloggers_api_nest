import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './domain/question.entity';
import { AdminQuizController } from './api/admin.quiz.controller';
import { QuestionsRepository } from './infrastructure/questions.repository';
import { CreateQuestionUseCase } from './application/questions/usecases/create-question.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateQuestionUseCase } from './application/questions/usecases/update-quest.usecase';
import { DeleteQuestionUseCase } from './application/questions/usecases/delete-question.usecase';
import { QuestionsQueryRepository } from './infrastructure/query/questions.query-repository';
import { GetQuestionsQueryHandler } from './application/questions/query/get-questions.query-handler';

const useCases = [
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  DeleteQuestionUseCase,
  GetQuestionsQueryHandler,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Question])],
  controllers: [AdminQuizController],
  providers: [QuestionsRepository, QuestionsQueryRepository, ...useCases],
})
export class QuizGameModule {}
