import { resolve } from 'path';

export const LoggerDefaultOptions = {
  logDir: resolve(__dirname, '../../../logs'),
  errorFileName: 'error.log',
  normalFileName: 'normal.log',
};
