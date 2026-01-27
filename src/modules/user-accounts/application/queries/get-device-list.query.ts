import { ICommandHandler, QueryHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { GetPostByIdQueryHandler } from '../../../bloggers-platform/posts/aplication/queries/get-post-by-id.query-handler';
import { DeviceListViewDto } from '../../api/view-dto/device-list.view-dto';
import { SessionsQueryRepository } from '../../infrastructure/query/sessions.query-repository';

export class GetDeviceListQuery {
  constructor(public userId: string) {}
}
@QueryHandler(GetDeviceListQuery)
export class GetDeviceListQueryHandler implements ICommandHandler<
  GetDeviceListQuery,
  DeviceListViewDto[]
> {
  constructor(
    private readonly sessionsQueryRepository: SessionsQueryRepository,
  ) {}
  async execute({ userId }: GetDeviceListQuery) {
    return await this.sessionsQueryRepository.findAll(userId);
  }
}
