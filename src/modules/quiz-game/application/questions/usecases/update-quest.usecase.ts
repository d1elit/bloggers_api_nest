import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../../infrastructure/questions.repository';
import { UpdateQuestionInputDto } from '../../../api/input-dto/update-question.input-dto';

export class UpdateQuestionCommand {
  constructor(
    public dto: UpdateQuestionInputDto,
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
