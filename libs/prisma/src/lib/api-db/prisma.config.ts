import { Prisma } from '@prisma/db-api';

export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
  level: LogLevel;
  emit: 'stdout' | 'event';
};

export const PRISMA_LOG_CONFIG: Array<LogDefinition> = [
  { level: 'warn', emit: 'stdout' },
  { level: 'info', emit: 'stdout' },
  { level: 'error', emit: 'stdout' },
  { level: 'query', emit: 'event' },
];

export const PRISMA_CLIENT_OPTIONS: Prisma.PrismaClientOptions = {
  log: PRISMA_LOG_CONFIG,
  transactionOptions: {
    maxWait: 10000,
    timeout: 20000,
  },
};
