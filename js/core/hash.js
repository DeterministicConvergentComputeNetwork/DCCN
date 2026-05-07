/**
 * DCCN — Deterministic Convergent Compute Network
 * SHA-256 hashing with runtime detection.
 *
 * Priority order:
 *   1. Web Crypto API  (browser, Node >= 15, Deno, Bun, Workers)
 *   2. Node.js crypto  (node:crypto via dynamic import)
 *   3. Pure-JS SHA-256 fallback (always available)
 *
 * Copyright (C) 2025 James Chapman <xhecarpenxer@gmail.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * This file is part of DCCN.
 *
 * DCCN is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * DCCN is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with DCCN. If not, see <https://www.gnu.org/licenses/>.
 */

'use strict';

import { bytesToHex, encodeUTF8 } from '../utils/index.js';

// ─── Pure-JS SHA-256 ─────────────────────────────────────────────────────────
// RFC 6234 compliant, no dependencies, works everywhere.

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr32(x, n) {
  return (x >>> n) | (x << (32 - n));
}

/**
 * Pure-JS SHA-256. Returns a hex string. Synchronous, no I/O.
 *
 * @param {Uint8Array} data
 * @returns {string} 64-char hex digest
 */
export function sha256PureJS(data) {
  // Pre-processing: padding
  const len = data.length;
  const bitLen = len * 8;
  // Padded length: next multiple of 64 with room for 0x80 and 8-byte length
  const padLen = ((len + 9 + 63) & ~63);
  const padded = new Uint8Array(padLen);
  padded.set(data);
  padded[len] = 0x80;
  // Big-endian 64-bit length (we only support up to 2^32 bits for simplicity)
  const dv = new DataView(padded.buffer);
  dv.setUint32(padLen - 4, bitLen >>> 0, false);
  dv.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);

  // Initial hash values
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  for (let off = 0; off < padLen; off += 64) {
    const chunk = new DataView(padded.buffer, off, 64);
    for (let i = 0; i < 16; i++) w[i] = chunk.getUint32(i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr32(w[i - 15], 7) ^ rotr32(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr32(w[i - 2], 17) ^ rotr32(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const odv = new DataView(out.buffer);
  odv.setUint32(0,  h0, false); odv.setUint32(4,  h1, false);
  odv.setUint32(8,  h2, false); odv.setUint32(12, h3, false);
  odv.setUint32(16, h4, false); odv.setUint32(20, h5, false);
  odv.setUint32(24, h6, false); odv.setUint32(28, h7, false);
  return bytesToHex(out);
}

// ─── Runtime-aware SHA-256 ────────────────────────────────────────────────────

let _nodeCrypto = null;
let _nodeCryptoAttempted = false;

async function tryLoadNodeCrypto() {
  if (_nodeCryptoAttempted) return _nodeCrypto;
  _nodeCryptoAttempted = true;
  try {
    // Dynamic import so bundlers can tree-shake for browser targets
    const mod = await import('node:crypto');
    _nodeCrypto = mod.default || mod;
  } catch {
    _nodeCrypto = null;
  }
  return _nodeCrypto;
}

/**
 * SHA-256 hash of a UTF-8 string, returning a 64-char hex string.
 * Async — uses the fastest available implementation for the runtime.
 *
 * @param {string} input
 * @returns {Promise<string>}
 */
export async function sha256(input) {
  const bytes = encodeUTF8(input);

  // 1. Web Crypto API (browser, Node >= 15, Deno, Bun, Workers)
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    globalThis.crypto.subtle
  ) {
    const buf = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return bytesToHex(new Uint8Array(buf));
  }

  // 2. Node.js crypto module
  const nodeCrypto = await tryLoadNodeCrypto();
  if (nodeCrypto && nodeCrypto.createHash) {
    const hash = nodeCrypto.createHash('sha256');
    hash.update(bytes);
    return hash.digest('hex');
  }

  // 3. Pure-JS fallback
  return sha256PureJS(bytes);
}

/**
 * Synchronous SHA-256 (pure-JS only).
 * Useful when you can't await and Web Crypto / Node crypto are unavailable.
 *
 * @param {string} input
 * @returns {string}
 */
export function sha256Sync(input) {
  return sha256PureJS(encodeUTF8(input));
}
