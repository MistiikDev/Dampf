import { Request, Response } from 'express';
import { UserSession } from '../decorators/activeSession.decorator';

// Jwt Request object
export interface CRequest extends Request {
  user: UserSession;
}
