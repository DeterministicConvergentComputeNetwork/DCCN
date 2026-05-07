/**
 * DCCN — Deterministic Convergent Compute Network
 * Content Identifier (CID) derivation.
 *
 * A CID is a stable, self-describing reference to a piece of content.
 * DCCN's CIDs are deliberately human-legible and prefix-tagged so that
 * a CID is visually distinct from a raw hash.
 *
 * Format:  bafy<first-44-hex-chars-of-sha256>
 * Example: bafyd807aa98243185be550c7dc372be5d7480deb1fe9bdc06a7
 *
 * The "bafy" prefix is borrowed from IPFS/CIDv1 aesthetics but is NOT
 * a valid multihash — DCCN CIDs are their own opaque namespace.
 *
 * Copyright (C) 2025 James Chapman <xhecarpenxer@gmail.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

'use strict';

const CID_PREFIX = 'bafy';
const CID_HASH_LEN = 44; // chars from the hex digest

/**
 * Derive a CID from a hex SHA-256 digest.
 *
 * @param {string} hexDigest  64-char hex string
 * @returns {string}
 */
export function cidFromHash(hexDigest) {
  if (typeof hexDigest !== 'string' || hexDigest.length < CID_HASH_LEN) {
    throw new Error(`cidFromHash: expected at least ${CID_HASH_LEN}-char hex, got: ${hexDigest}`);
  }
  return CID_PREFIX + hexDigest.slice(0, CID_HASH_LEN);
}

/**
 * Extract the hash fragment from a CID (inverse of cidFromHash).
 * Note: this returns only the partial hash embedded in the CID, not the full digest.
 *
 * @param {string} cid
 * @returns {string}  partial hex (44 chars)
 */
export function hashFromCID(cid) {
  if (!cid.startsWith(CID_PREFIX)) {
    throw new Error(`hashFromCID: not a DCCN CID: ${cid}`);
  }
  return cid.slice(CID_PREFIX.length);
}

/**
 * Returns true if the string looks like a DCCN CID.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isCID(value) {
  return (
    typeof value === 'string' &&
    value.startsWith(CID_PREFIX) &&
    value.length === CID_PREFIX.length + CID_HASH_LEN
  );
}
