import {
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { DomainExceptionCode } from '../core/exceptions/domain-exception-codes';
import {
  DomainException,
  Extension,
} from '../core/exceptions/domain-exceptions';

export const errorFormatter = (
  errors: ValidationError[],
  errorMessage?: any,
): Extension[] => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const errorsForResponse: any = errorMessage || [];

  for (const error of errors) {
    if (!error.constraints && error.children?.length) {
      errorFormatter(error.children, errorsForResponse);
    } else if (error.constraints) {
      const constrainKeys = Object.keys(error.constraints);

      for (const key of constrainKeys) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        errorsForResponse.push({
          message: error.constraints[key]
            ? `${error.constraints[key]}; Received value: ${error?.value}`
            : '',
          key: error.property,
        });
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return errorsForResponse;
};

export function pipesSetup(app: INestApplication) {
  //Глобальный пайп для валидации и трансформации входящих данных.
  //На следующем занятии рассмотрим подробнее

  app.useGlobalPipes(
    new ValidationPipe({
      //class-transformer создает экземпляр dto
      //соответственно применятся значения по-умолчанию
      //и методы классов dto
      transform: true,

      whitelist: true,
      //Выдавать первую ошибку для каждого поля
      // stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errorFormatter(errors);

        throw new DomainException({
          code: DomainExceptionCode.ValidationError,
          message: 'Validation failed',
          extensions: formattedErrors,
        });
      },
    }),
  );
}
