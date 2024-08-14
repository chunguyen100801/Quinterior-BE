import { Injectable } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';

import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { QUEUES } from '@datn/shared';

@Injectable()
@Processor(QUEUES.SEND_MAIL)
export class SendMailProcessor extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(
    job: Job<{
      to: string;
      from: string;
      subject: string;
      template: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context: Record<string, any>;
    }>,
  ): Promise<void> {
    console.log('Processing job', job.id);
    await this.mailerService.sendMail({
      to: job.data.to,
      from: job.data.from,
      subject: job.data.subject,
      template: job.data.template,
      context: job.data.context,
    });
  }

  @OnWorkerEvent('failed')
  onFailed(): void {
    console.log('failed');
  }

  @OnWorkerEvent('completed')
  onCompleted(): void {
    console.log('completed');
  }
}
