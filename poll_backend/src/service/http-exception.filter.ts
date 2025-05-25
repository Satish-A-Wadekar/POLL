/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch()
export class AllExceptionsFilter {
  catch(exception: any, host: ArgumentsHost) {
    if (host.getType() === 'ws') {
      // For WebSocket connections
      return new WsException({
        message: exception?.message,
        name: exception?.name,
      });
    }
    // ... HTTP exception handling
  }
}
