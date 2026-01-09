import { LoginInput } from './login.input.dto';

export type authInput = {
  loginDto: LoginInput;
  ip: string;
  deviceName: string;
};
