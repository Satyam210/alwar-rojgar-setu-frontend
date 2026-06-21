import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { getDb } from './db';
import { HttpError, matchRoute, resolveUser, type HandlerCtx, type HandlerResult } from './handlers';

const API_PREFIX = '/api/v1';
const LATENCY_MS = 200;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function readHeader(config: InternalAxiosRequestConfig, name: string): string | null {
  const h = config.headers as unknown as
    | { get?: (n: string) => unknown; [k: string]: unknown }
    | undefined;
  if (!h) return null;
  const value = typeof h.get === 'function' ? h.get(name) : h[name];
  return value == null ? null : String(value);
}

function parseBody(config: InternalAxiosRequestConfig): {
  body: Record<string, unknown>;
  formData: FormData | null;
} {
  const data = config.data;
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    return { body: {}, formData: data };
  }
  if (typeof data === 'string') {
    try {
      return { body: JSON.parse(data) as Record<string, unknown>, formData: null };
    } catch {
      return { body: {}, formData: null };
    }
  }
  if (data && typeof data === 'object') return { body: data as Record<string, unknown>, formData: null };
  return { body: {}, formData: null };
}

function normalisePath(config: InternalAxiosRequestConfig): string {
  let path = (config.url ?? '').split('?')[0];
  if (path.startsWith(API_PREFIX)) path = path.slice(API_PREFIX.length);
  return path || '/';
}

export const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  await wait(LATENCY_MS);

  const method = (config.method ?? 'get').toUpperCase();
  const path = normalisePath(config);
  const matched = matchRoute(method, path);

  const respond = (status: number, data: unknown): AxiosResponse => ({
    data,
    status,
    statusText: status >= 400 ? 'Error' : 'OK',
    headers: {},
    config,
    request: {},
  });

  if (!matched) {
    return Promise.reject(
      new AxiosError(
        `No mock handler for ${method} ${path}`,
        'ERR_BAD_REQUEST',
        config,
        {},
        respond(404, { message: `Not found: ${method} ${path}` }),
      ),
    );
  }

  const { body, formData } = parseBody(config);
  const ctx: HandlerCtx = {
    params: matched.params,
    query: (config.params as Record<string, unknown>) ?? {},
    body,
    formData,
    db: getDb(),
    user: resolveUser(readHeader(config, 'Authorization')),
  };

  try {
    const out = matched.route.handler(ctx);
    // Handlers return a bare payload, or an explicit envelope via reply().
    const isEnvelope =
      out !== null && typeof out === 'object' && (out as HandlerResult).__envelope === true;
    const status = isEnvelope ? (out as HandlerResult).status : 200;
    const data = isEnvelope ? (out as HandlerResult).data : out;
    return respond(status, data);
  } catch (err) {
    if (err instanceof HttpError) {
      return Promise.reject(
        new AxiosError(
          err.message,
          'ERR_BAD_REQUEST',
          config,
          {},
          respond(err.status, { message: err.message, fieldErrors: err.fieldErrors }),
        ),
      );
    }
    return Promise.reject(
      new AxiosError(
        (err as Error)?.message ?? 'Mock handler error',
        'ERR_BAD_REQUEST',
        config,
        {},
        respond(500, { message: (err as Error)?.message ?? 'Mock handler error' }),
      ),
    );
  }
};
