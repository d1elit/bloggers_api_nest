import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { jwtDecode } from 'jwt-decode';
import { SessionsRepository } from '../../infrastructure/sessions.repository';

export class LogoutCommand {
  constructor(public token: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand, void> {
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute(command: LogoutCommand): Promise<void> {
    const { iat } = jwtDecode(command.token);
    await this.sessionsRepository.delete(iat!);
  }
}
