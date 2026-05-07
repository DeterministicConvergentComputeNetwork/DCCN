/**
 * DCCN — Deterministic Convergent Compute Network
 * Runtime-agnostic UTF-8 encoding utilities.
 *
 * Works in:
 *   - Browsers (TextEncoder native)
 *   - Node.js >= 11 (TextEncoder in globalThis)
 *   - Deno, Bun, Cloudflare Workers, etc.
 *   - Fallback: pure-JS UTF-8 encoder for edge runtimes
 *
 * Copyright (C) 2025 James Chapman <xhecarpenxer@gmail.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

'use strict';

/**
 * Encode a string to UTF-8 bytes.
 * Uses native TextEncoder when available, falls back to manual encoding.
 *
 * @param {string} str
 * @returns {Uint8Array}
 */
export function encodeUTF8(str) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str);
  }
  // Pure-JS UTF-8 fallback
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    // Handle surrogate pairs
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const hi = code;
      const lo = str.charCodeAt(i + 1);
      if (lo >= 0xdc00 && lo <= 0xdfff) {
        code = 0x10000 + ((hi - 0xd800) << 10) + (lo - 0xdc00);
        i++;
      }
    }
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    } else {
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    }
  }
  return new Uint8Array(bytes);
}
