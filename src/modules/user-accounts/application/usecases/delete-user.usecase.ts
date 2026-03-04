import { UsersRepository } from '../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<
  DeleteUserCommand,
  void
> {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ id }: DeleteUserCommand): Promise<void> {
    console.log('DELETE EXECUTE');
    const user = await this.usersRepository.findOrNotFoundFail(id);
    console.log('USER FOR DELETE FIND');
    console.log(user);
    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}
