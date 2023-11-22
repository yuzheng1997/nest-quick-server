import {
  Injectable,
  LoggerService as NestLoggerService,
  Optional,
} from '@nestjs/common';
import * as process from 'process';
import { TransformableInfo } from 'logform';
import { bold, cyan, green, magenta, red, yellow } from '@colors/colors';
import { createLogger, format, Logger, transports } from 'winston';
import { getTimestamp, parseCallStack, Stack } from '../utils';
import { LoggerDefaultOptions } from './logger.constans';
import 'winston-daily-rotate-file';

export let stack: Partial<Stack>;

export const getPid = () => {
  return green(`[Nest] ${process.pid}  - `);
};

export const defaultFormat = (info: TransformableInfo) => {
  const { level, message, context, ms } = info;
  return `${getPid()}${getTimestamp()}${formatLevel(level)}${formatContext(
    context,
  )}${green(message)} ${yellow(ms)}`;
};

const LevelShader = {
  VERBOSE: cyan,
  DEBUG: magenta,
  WARN: yellow,
  ERROR: red,
};
export const formatLevel = (level: string) => {
  level = level.toUpperCase();
  const shader = LevelShader[level] || bold;
  return ` ${shader(level)} `.padStart(7, ' ');
};
export const formatContext = (context: string) => {
  context = context ? context : stack.className;
  let result = '';
  if (context) result += ` [${yellow(context)}] `;
  if (stack.functionName) result += `[method: ${yellow(stack.functionName)}] `;
  return result;
};

@Injectable()
export class LoggerService implements NestLoggerService {
  private context: string;
  private options: Record<string, any>;
  private logger: Logger;

  constructor();
  constructor(context?: string);
  constructor(
    @Optional() context?: string,
    @Optional() options?: Record<string, any>,
  ) {
    this.context = context;
    this.options = options;
    this.init();
  }

  init() {
    const logger = createLogger();
    const consoleTransport = new transports.Console({
      level: 'info',
      format: format.combine(
        format.ms(),
        format.timestamp(),
        format.printf(defaultFormat),
      ),
    });
    const options = {
      dirname: LoggerDefaultOptions.logDir,
      maxSize: '2m',
      maxFiles: '30d',
    };
    const errorDailyRotateFile = new transports.DailyRotateFile({
      filename: LoggerDefaultOptions.errorFileName,
      level: 'error',
      format: format.combine(
        format.ms(),
        format.timestamp(),
        format.printf(defaultFormat),
      ),
      ...options,
    });
    logger.add(consoleTransport);
    logger.add(errorDailyRotateFile);
    this.logger = logger;
  }

  /**
   * Write a 'log' level log.
   */
  log(message: string, ...meta: any[]) {
    this.printMessage('info', message, meta);
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...meta: any[]) {
    this.printMessage('error', message, meta);
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: string, ...meta: any[]) {
    this.printMessage('warn', message, meta);
  }

  /**
   * Write a 'debug' level log.
   */
  debug(message: any, ...meta: any[]) {
    this.printMessage('debug', message, meta);
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose(message: any, ...meta: any[]) {
    this.printMessage('verbose', message, meta);
  }

  /**
   * Write a 'fatal' level log.
   */
  fatal(message: any, ...meta: any[]) {
    this.printMessage('fatal', message, meta);
  }

  printMessage(level: string, message: any, ...mate: any[]) {
    let data: Error;
    if (message instanceof Error) {
      data = message;
      stack = parseCallStack(data);
    } else {
      data = new Error();
      stack = parseCallStack(data, 4);
    }
    this.logger.log(level, message, mate);
  }
}
