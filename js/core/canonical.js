/**
 * DCCN — Deterministic Convergent Compute Network
 * Canonical JSON serialization.
 *
 * The DCCN identity invariant:
 *   Identity(x) = SHA-256(Canonical(x))
 *
 * Rules:
 *   - Object keys sorted lexicographically (Unicode code point order)
 *   - Arrays preserve order
 *   - Primitives are passed through unchanged
 *   - JSON.stringify output is used (no trailing whitespace, no indentation)
 *
 * This is compatible with RFC 8785 (JSON Canonicalization Scheme) for
 * the subset of values DCCN operates on.
 *
 * Copyright (C) 2025 James Chapman <xhecarpenxer@gmail.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

'use strict';

/**
 * Recursively canonicalize a value.
 * Returns a new deep structure with all object keys sorted.
 *
 * @param {unknown} value
 * @returns {unknown}
 */
export function canonicalize(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  return Object.keys(value)
    .sort()
    .reduce((acc, k) => {
      acc[k] = canonicalize(value[k]);
      return acc;
    }, {});
}

/**
 * Serialize a value to its canonical JSON string.
 * This string is the pre-image for all DCCN hashes.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function canonicalJSON(value) {
  return JSON.stringify(canonicalize(value));
}

/**
 * Compute the canonical hash of a value using the provided hash function.
 *
 * @param {unknown} value
 * @param {(s: string) => Promise<string>} hashFn  async (string) => hexDigest
 * @returns {Promise<string>}
 */
export async function canonicalHash(value, hashFn) {
  return hashFn(canonicalJSON(value));
}
