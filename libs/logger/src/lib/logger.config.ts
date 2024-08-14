import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import { format, transports } from 'winston';
import 'winston-daily-rotate-file';
import { ClsServiceManager } from 'nestjs-cls';
import { LoggerService } from '@nestjs/common';

const logFormat = format.combine(
  format.timestamp(),
  format.printf((info) => {
    const {
      timestamp,
      severity,
      httpMethod,
      requestUrl,
      level,
      message,
      stack,
      data,
    } = info;
    const requestId = ClsServiceManager.getClsService().getId();
    const logObject = {
      timestamp,
      level,
      severity,
      requestId,
      httpMethod,
      requestUrl,
      message,
      stackTrace: stack,
      data,
    };
    return JSON.stringify(logObject);
  }),
);

const transportsConfig = [
  new transports.Console({
    format: format.combine(
      format.timestamp(),
      format.ms(),
      nestWinstonModuleUtilities.format.nestLike('Quinterior', {
        colors: true,
        prettyPrint: true,
      }),
    ),
  }),
  new transports.DailyRotateFile({
    level: 'error',
    dirname: 'logs/error',
    filename: 'application-error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '5m',
    maxFiles: '14d',
  }),
  new transports.DailyRotateFile({
    level: 'info',
    dirname: 'logs/info',
    filename: 'application-info-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '5m',
    maxFiles: '14d',
    format: logFormat,
  }),
];

export const loggerConfig: LoggerService = WinstonModule.createLogger({
  transports: transportsConfig,
});
