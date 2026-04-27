import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../../infrastructure/questions.repository';

export class DeleteQuestionCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase implements ICommandHandler<
  DeleteQuestionCommand,
  void
> {
  constructor(private readonly questionRepository: QuestionsRepository) {}

  async execute({ id }: DeleteQuestionCommand) {
    const question = await this.questionRepository.findOrNotFoundFail(id);
    question.makeDeleted();
    await this.questionRepository.save(question);
  }
}
