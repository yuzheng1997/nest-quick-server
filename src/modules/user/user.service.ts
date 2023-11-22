import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../shared/logger/logger.service';

@Injectable()
export class UserService {
  constructor(private logger: LoggerService) {}
  getUserInfo(id: string) {
    this.logger.log('123');
    try {
      throw new Error('错误');
    } catch (e) {
      this.logger.error(e);
    }
  }
}
