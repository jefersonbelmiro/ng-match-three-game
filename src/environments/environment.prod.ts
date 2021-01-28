import dotenv from './dotenv';

export const environment = {
  production: true,
  ...dotenv,
} as any;
