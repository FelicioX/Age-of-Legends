import { clientMessageSchema, type ValidatedClientMessage } from './schemas.js';

/** Discriminated result of a validation attempt. */
export type ParseResult<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string };

/**
 * Validate and parse raw JSON text received from a client into a typed message.
 *
 * Returns a discriminated result rather than throwing, so callers at the
 * network boundary can reject malformed input without exception-based control
 * flow. Never trust the input before this succeeds.
 */
export function parseClientMessage(raw: string): ParseResult<ValidatedClientMessage> {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'invalid_json' };
  }

  const result = clientMessageSchema.safeParse(json);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? 'invalid_message' };
  }

  return { ok: true, value: result.data };
}
