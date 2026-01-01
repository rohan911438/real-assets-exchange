import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;
}

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  logger.error('API Error:', {
    error: err.message,
    stack: err.stack,
    code: err.code,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: err.details || {}
    },
    data: null,
    timestamp: new Date().toISOString()
  });
};

// Common error types
export const createError = {
  badRequest: (message: string, details?: any) => 
    new AppError(message, 400, 'BAD_REQUEST', details),
  
  unauthorized: (message: string = 'Unauthorized') => 
    new AppError(message, 401, 'UNAUTHORIZED'),
  
  forbidden: (message: string = 'Forbidden') => 
    new AppError(message, 403, 'FORBIDDEN'),
  
  notFound: (message: string = 'Resource not found') => 
    new AppError(message, 404, 'NOT_FOUND'),
  
  conflict: (message: string, details?: any) => 
    new AppError(message, 409, 'CONFLICT', details),
  
  tooManyRequests: (message: string = 'Too many requests') => 
    new AppError(message, 429, 'TOO_MANY_REQUESTS'),
  
  internal: (message: string = 'Internal server error', details?: any) => 
    new AppError(message, 500, 'INTERNAL_ERROR', details),
  
  blockchain: (message: string, details?: any) => 
    new AppError(message, 503, 'BLOCKCHAIN_ERROR', details),
  
  insufficientBalance: (message: string = 'Insufficient balance') => 
    new AppError(message, 400, 'INSUFFICIENT_BALANCE'),
  
  invalidSignature: (message: string = 'Invalid signature') => 
    new AppError(message, 400, 'INVALID_SIGNATURE'),
  
  complianceRequired: (message: string = 'KYC verification required') => 
    new AppError(message, 403, 'COMPLIANCE_REQUIRED')
};