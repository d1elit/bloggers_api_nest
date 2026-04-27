import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { QuestionInputDto } from './input-dto/question.input-dto';
import { CreateQuestionCommand } from '../application/questions/usecases/create-question.usecase';
import { UpdateQuestionCommand } from '../application/questions/usecases/update-quest.usecase';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';
import { DeleteQuestionCommand } from '../application/questions/usecases/delete-question.usecase';

@UseGuards(BasicAuthGuard)
@Controller('sa/quiz')
export class AdminQuizController {
  constructor(
    private readonly commandBus: CommandBus,
    // private readonly queryBus: QueryBus,
  ) {}

  @Post('/questions')
  async createQuestion(@Body() body: QuestionInputDto) {
    return await this.commandBus.execute<CreateQuestionCommand, string>(
      new CreateQuestionCommand(body),
    );
  }

  @Delete('/questions/:id')
  async deleteQuestion(@Param('id') id: string) {
    return await this.commandBus.execute<DeleteQuestionCommand, string>(
      new DeleteQuestionCommand(id),
    );
  }

  @Put('/questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(
    @Body() body: QuestionInputDto,
    @Param('id') id: string,
  ) {
    return await this.commandBus.execute<UpdateQuestionCommand, string>(
      new UpdateQuestionCommand(body, id),
    );
  }
}
