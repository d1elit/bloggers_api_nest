import { QuestionInputDto } from '../../../api/input-dto/question.input-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../../infrastructure/questions.repository';

export class UpdateQuestionCommand {
  constructor(
    public dto: QuestionInputDto,
    public id: string,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<
  UpdateQuestionCommand,
  void
> {
  constructor(private readonly questionRepository: QuestionsRepository) {}

  async execute({ dto, id }: UpdateQuestionCommand) {
    const question = await this.questionRepository.findOrNotFoundFail(id);
    question.update(dto);
    await this.questionRepository.save(question);
  }
}
