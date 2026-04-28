import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { QuestionInputDto } from './input-dto/question.input-dto';
import { CreateQuestionCommand } from '../application/questions/usecases/create-question.usecase';
import { UpdateQuestionCommand } from '../application/questions/usecases/update-quest.usecase';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';
import { DeleteQuestionCommand } from '../application/questions/usecases/delete-question.usecase';
import { GetQuestionsQueryParams } from './input-dto/get-questions-query-params';
import { GetQuestionsQuery } from '../application/questions/query/get-questions.query-handler';
import { UpdateQuestionInputDto } from './input-dto/update-question.input-dto';

@UseGuards(BasicAuthGuard)
@Controller('sa/quiz')
export class AdminQuizController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('/questions')
  async getAllQuestions(@Query() query: GetQuestionsQueryParams) {
    return this.queryBus.execute(new GetQuestionsQuery(query));
  }

  @Post('/questions')
  async createQuestion(@Body() body: QuestionInputDto) {
    return await this.commandBus.execute<CreateQuestionCommand, string>(
      new CreateQuestionCommand(body),
    );
  }

  @Put('/questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async makePublished(
    @Body() body: UpdateQuestionInputDto,
    @Param('id') id: string,
  ) {
    return await this.commandBus.execute(new UpdateQuestionCommand(body, id));
  }

  @Delete('/questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
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
