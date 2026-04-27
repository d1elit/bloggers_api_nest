import { QuestionInputDto } from '../../../api/input-dto/question.input-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../../infrastructure/questions.repository';
import { Question } from '../../../domain/question.entity';

export class CreateQuestionCommand {
  constructor(public dto: QuestionInputDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<
  CreateQuestionCommand,
  Question
> {
  constructor(private readonly questionRepository: QuestionsRepository) {}

  async execute({ dto }: CreateQuestionCommand) {
    const entity = Question.createInstance(dto);
    await this.questionRepository.save(entity);
    return entity;
  }
}
