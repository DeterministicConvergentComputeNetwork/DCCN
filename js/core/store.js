/**
 * DCCN — Deterministic Convergent Compute Network
 * Content-Addressable Object Store.
 *
 * Objects are stored and retrieved exclusively by their CID.
 * The store guarantees:
 *   - Write-once: CID → object mapping is immutable
 *   - Integrity: retrieval can re-verify the stored hash
 *   - Determinism: two stores with the same objects have the same CIDs
 *
 * The default implementation is an in-memory Map.
 * You can provide any backend that satisfies the StoreBackend interface.
 *
 * Copyright (C) 2025 James Chapman <xhecarpenxer@gmail.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

'use strict';

import { sha256 } from './hash.js';
import { canonicalHash, canonicalJSON } from './canonical.js';
import { cidFromHash, isCID } from './cid.js';

/**
 * @typedef {{ obj: unknown, hash: string }} StoreEntry
 */

/**
 * Content-Addressable Object Store.
 *
 * @example
 * const store = new ObjectStore();
 * const { cid } = await store.put({ hello: 'world' });
 * const entry = store.get(cid);
 */
export class ObjectStore {
  /** @type {Map<string, StoreEntry>} */
  #store = new Map();

  /**
   * Store an object by content-address.
   * Returns the CID and hash of the stored object.
   *
   * @param {unknown} obj
   * @returns {Promise<{ cid: string, hash: string }>}
   */
  async put(obj) {
    const hash = await canonicalHash(obj, sha256);
    const cid = cidFromHash(hash);
    if (!this.#store.has(cid)) {
      this.#store.set(cid, { obj, hash });
    }
    return { cid, hash };
  }

  /**
   * Retrieve a stored object by CID.
   *
   * @param {string} cid
   * @returns {StoreEntry | undefined}
   */
  get(cid) {
    return this.#store.get(cid);
  }

  /**
   * Check whether a CID exists in the store.
   *
   * @param {string} cid
   * @returns {boolean}
   */
  has(cid) {
    return this.#store.has(cid);
  }

  /**
   * Verify the integrity of a stored object.
   * Re-hashes the stored value and compares against the stored hash and CID.
   *
   * @param {string} cid
   * @returns {Promise<{ valid: boolean, storedHash: string, recomputedHash: string, cidMatch: boolean }>}
   */
  async verify(cid) {
    const entry = this.#store.get(cid);
    if (!entry) throw new Error(`verify: CID not found: ${cid}`);
    const recomputedHash = await canonicalHash(entry.obj, sha256);
    const recomputedCID = cidFromHash(recomputedHash);
    return {
      valid: recomputedHash === entry.hash,
      storedHash: entry.hash,
      recomputedHash,
      cidMatch: recomputedCID === cid,
    };
  }

  /**
   * Number of objects in the store.
   * @returns {number}
   */
  get size() {
    return this.#store.size;
  }

  /**
   * Iterate over all CIDs in the store.
   * @returns {IterableIterator<string>}
   */
  keys() {
    return this.#store.keys();
  }

  /**
   * Export the store as a plain object (for serialization).
   * @returns {Record<string, StoreEntry>}
   */
  export() {
    const out = {};
    for (const [cid, entry] of this.#store) {
      out[cid] = entry;
    }
    return out;
  }

  /**
   * Import entries from a previously exported store snapshot.
   * Does NOT re-verify hashes — call verify() if needed.
   *
   * @param {Record<string, StoreEntry>} snapshot
   */
  import(snapshot) {
    for (const [cid, entry] of Object.entries(snapshot)) {
      this.#store.set(cid, entry);
    }
  }

  /**
   * Clear all stored objects.
   */
  clear() {
    this.#store.clear();
  }
}
