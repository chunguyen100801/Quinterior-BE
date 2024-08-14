import * as opentelemetry from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions/build/src/resource/SemanticResourceAttributes';
import { Logger } from '@nestjs/common';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { context } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

export const initTracing = async (): Promise<void> => {
  const logger = new Logger('Tracing');
  const traceExporterJaeger = new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
  });

  const spanProcessorJaeger =
    process.env['NODE_ENV'] === `development`
      ? new SimpleSpanProcessor(traceExporterJaeger)
      : new BatchSpanProcessor(traceExporterJaeger);

  const contextManager = new AsyncHooksContextManager().enable();

  context.setGlobalContextManager(contextManager);

  const oltpExporterHoneyComb = new OTLPTraceExporter({
    url: `https://api.honeycomb.io/v1/traces`,
    headers: {
      'x-honeycomb-team': process.env['HONEYCOMB_API_KEY'],
    },
  });

  const spanProcessorHoneyComb =
    process.env['NODE_ENV'] === `development`
      ? new SimpleSpanProcessor(oltpExporterHoneyComb)
      : new BatchSpanProcessor(oltpExporterHoneyComb);

  const sdk = new opentelemetry.NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: 'Quinterior api',
      [SEMRESATTRS_SERVICE_VERSION]: '1.0',
    }),
    instrumentations: [
      new NestInstrumentation(),
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new PrismaInstrumentation(),
    ],
    spanProcessors: [spanProcessorJaeger, spanProcessorHoneyComb],
  });

  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });

  try {
    sdk.start();
    logger.log('Tracing initialized');
  } catch (error) {
    logger.error('Error initializing tracing', error);
  }
};
