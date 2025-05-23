import { ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
export declare class AllExceptionsFilter {
    catch(exception: any, host: ArgumentsHost): WsException | undefined;
}
