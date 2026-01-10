import { Extension } from '../domain-exceptions';
import { DomainExceptionCode } from '../domain-exception-codes';

// export type ErrorResponseBody = {
//   timestamp: string;
//   path: string | null;
//   message: string;
//   extensions: Extension[];
//   code: DomainExceptionCode;
// };

export type FieldError = {
  message: string;
  field: string;
};

export type ErrorResponseBody = {
  errorsMessages: FieldError[];
};

// Для внутреннего использования (расширенный формат)
export type DetailedErrorResponseBody = {
  timestamp: string;
  path: string;
  message: string;
  code: number;
  extensions: any[];
};
