import dotenv from './dotenv';

export const environment = {
  production: false,
  ...dotenv,
} as any;
