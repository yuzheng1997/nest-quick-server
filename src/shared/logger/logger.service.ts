import {
  Injectable,
  LoggerService as NestLoggerService,
  Optional,
} from '@nestjs/common';
import * as process from 'process';
import { Format, TransformableInfo } from 'logform';
import { bold, cyan, green, magenta, red, yellow } from '@colors/colors';
import { createLogger, format, Logger, transports } from 'winston';
import { getTimestamp, isString, parseCallStack, Stack } from '../utils';
import { LoggerDefaultOptions } from './logger.constans';
import 'winston-daily-rotate-file';
import { isPlainObject } from '@nestjs/common/utils/shared.utils';

export let stack: Partial<Stack>;

const getContext = (meta: any[] | Record<string, any>) => {
  if (isPlainObject(meta)) {
    meta.length = Object.keys(meta).length;
    meta = Array.from(meta as ArrayLike<any>);
  }
  if (isString(meta[meta.length - 1])) return meta[meta.length - 1];
  return '';
};

export const getPid = () => {
  return `[Nest] ${process.pid}  - `;
};

export const defaultFormat = (info: TransformableInfo) => {
  const { level, message, ms, metadata = {} } = info;
  const context = getContext(metadata);
  const levelUpper = level.toUpperCase();
  const shader = LevelShader[levelUpper] || bold;
  return `${green(getPid())}${getTimestamp()}${shader(
    levelUpper.padStart(7, ' '),
  )}${green(formatContext(context))}${green(message)} ${yellow(ms)}`;
};

const getLoggerFormat = (
  print: (info: TransformableInfo) => string = defaultFormat,
  labelData?: Record<string, any>,
): Format => {
  return format.combine(
    format.metadata(labelData),
    format.ms(),
    format.timestamp(),
    format.printf(print),
  );
};

const LevelShader = {
  VERBOSE: cyan,
  DEBUG: magenta,
  WARN: yellow,
  ERROR: red,
};
export const formatLevel = (level: string) => {
  return ` ${level} `.padStart(7, ' ');
};
export const formatContext = (context: string) => {
  if (context) {
    return ` [${context}] `;
  }
  let result = '';
  if (stack) result += ` [${stack.className} method: ${stack.functionName}] `;
  return result;
};

@Injectable()
export class LoggerService implements NestLoggerService {
  private options: Record<string, any>;
  private logger: Logger;

  constructor();
  constructor();
  constructor(@Optional() options?: Record<string, any>) {
    this.options = options;
    this.init();
  }

  init() {
    const logger = createLogger();
    const consoleTransport = new transports.Console({
      level: 'info',
      format: getLoggerFormat(),
    });
    const options = {
      dirname: LoggerDefaultOptions.logDir,
      maxSize: '2m',
      maxFiles: '30d',
    };
    const errorDailyRotateFile = new transports.DailyRotateFile({
      filename: LoggerDefaultOptions.errorFileName,
      level: 'error',
      format: getLoggerFormat((info) => {
        const { level, message, context } = info;
        return `${getPid()}${getTimestamp()}${level
          .toUpperCase()
          .padStart(7, ' ')}${formatContext(context)}${message.stack}`;
      }),
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

  printMessage(level: string, message: any, ...meta: any[]) {
    let data: Error;
    if (message instanceof Error) {
      data = message;
      stack = parseCallStack(data);
      // 没有传入context通过错误栈获取
    } else if (!getContext(meta)) {
      data = new Error();
      stack = parseCallStack(data, 3);
    }
    this.logger.log(level, message, ...meta);
  }
}
