import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './domain/question.entity';
import { AdminQuizController } from './api/admin.quiz.controller';
import { QuestionsRepository } from './infrastructure/questions.repository';
import { CreateQuestionUseCase } from './application/questions/usecases/create-question.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateQuestionUseCase } from './application/questions/usecases/update-quest.usecase';
import { DeleteQuestionUseCase } from './application/questions/usecases/delete-question.usecase';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Question])],
  controllers: [AdminQuizController],
  providers: [
    QuestionsRepository,
    CreateQuestionUseCase,
    UpdateQuestionUseCase,
    DeleteQuestionUseCase,
  ],
})
export class QuizGameModule {}
