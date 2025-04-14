import { IRequest, Router } from 'itty-router';

export const cors = (request: IRequest) => {
  const origin = request.headers.get('Origin') || '*';
  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  return headers;
}; 