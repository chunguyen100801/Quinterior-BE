import { ApiBearerAuth } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';
import { MailService } from './mail.service';

@ApiBearerAuth()
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}
}
