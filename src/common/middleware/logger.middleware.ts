// src/common/middleware/logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const log = `${new Date().toISOString()} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms\n`;
      const logsDir = path.join(process.cwd(), 'logs');
      const logFilePath = path.join(logsDir, 'response-time.log');

      // Append log to the file
      fs.appendFile(logFilePath, log, (err) => {
        if (err) {
          console.error('Failed to write log:', err);
        }
      });
    });

    next();
  }
}
