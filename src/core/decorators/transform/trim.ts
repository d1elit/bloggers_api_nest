import { Transform, TransformFnParams } from 'class-transformer';

export const Trim = (): PropertyDecorator =>
  Transform(({ value }: TransformFnParams): string =>
    typeof value === 'string' ? value.trim() : value,
  );
