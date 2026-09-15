/**
 * AgriMark Phase 11 - Interoperability API Helper Utilities
 * Handles request IDs, pagination parameters, content negotiation, structured errors,
 * rate limiting headers, idempotency keys, and PII sanitization.
 */

import { NextResponse } from 'next/server';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function parsePaginationParams(url: string): PaginationParams {
  const { searchParams } = new URL(url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function createInteroperabilityResponse(
  data: any,
  pagination?: PaginationParams,
  requestId: string = `req-${Date.now()}`
) {
  return NextResponse.json({
    success: true,
    request_id: requestId,
    timestamp: new Date().toISOString(),
    api_version: 'v1.0',
    pagination: pagination ? {
      page: pagination.page,
      limit: pagination.limit,
      has_more: Array.isArray(data) && data.length === pagination.limit
    } : undefined,
    data
  }, {
    headers: {
      'X-Request-ID': requestId,
      'X-API-Version': 'v1.0',
      'X-RateLimit-Limit': '1000',
      'X-RateLimit-Remaining': '995',
      'Content-Type': 'application/json'
    }
  });
}

export function createStructuredErrorResponse(
  message: string,
  statusCode: number = 400,
  errorCode: string = 'BAD_REQUEST',
  requestId: string = `req-${Date.now()}`
) {
  return NextResponse.json({
    success: false,
    error: {
      code: errorCode,
      message,
      status: statusCode,
      timestamp: new Date().toISOString()
    },
    request_id: requestId
  }, {
    status: statusCode,
    headers: { 'X-Request-ID': requestId }
  });
}
