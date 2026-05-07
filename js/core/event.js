/**
 * DCCN — Deterministic Convergent Compute Network
 * Immutable, hash-linked event log.
 *
 * Every event in the DCCN log is an immutable record:
 *   { type, payload, parent, timestampLogical, hash, cid }
 *
 * The CID of an event is derived from the canonical hash of the body
 * (before hash/cid fields are added), making every event tamper-evident.
 *
 * Copyright (C) 2025 James Chapman <xhecarpenxer@gmail.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

'use strict';

import { canonicalize, canonicalHash } from './canonical.js';
import { cidFromHash } from './cid.js';

const GENESIS_PARENT = 'genesis';

/**
 * Build a new immutable, content-addressed event.
 *
 * @param {string}  eventType
 * @param {unknown} payload
 * @param {string[]} parentCids
 * @param {number}  logicalTime  1-indexed monotonic counter
 * @returns {Promise<DCCNEvent>}
 */
export async function buildEvent(eventType, payload, parentCids, logicalTime) {
  const canonicalPayload = canonicalize(payload);
  const body = {
    type: eventType,
    payload: canonicalPayload,
    parent: parentCids,
    timestampLogical: logicalTime,
  };
  const hash = await canonicalHash(body, async (s) => {
    // sha256 is async; use dynamic import to avoid circular dep with hash.js
    const { sha256 } = await import('./hash.js');
    return sha256(s);
  });
  const cid = cidFromHash(hash);
  return Object.freeze({
    type: eventType,
    payload: canonicalPayload,
    parent: parentCids,
    timestampLogical: logicalTime,
    hash,
    cid,
  });
}

/**
 * @typedef {Object} DCCNEvent
 * @property {string}   type
 * @property {unknown}  payload
 * @property {string[]} parent
 * @property {number}   timestampLogical
 * @property {string}   hash
 * @property {string}   cid
 */

/**
 * Append-only, in-memory event log.
 * Enforces monotonic logical timestamps and hash-chain integrity.
 */
export class EventLog {
  /** @type {DCCNEvent[]} */
  #events = [];

  /**
   * Append a new event to the log.
   *
   * @param {string}  type
   * @param {unknown} payload
   * @returns {Promise<DCCNEvent>}
   */
  async append(type, payload) {
    const parentCids = this.#events.length > 0
      ? [this.#events[this.#events.length - 1].cid]
      : [GENESIS_PARENT];
    const logicalTime = this.#events.length + 1;
    const event = await buildEvent(type, payload, parentCids, logicalTime);
    this.#events.push(event);
    return event;
  }

  /**
   * Immutable ordered view of all events.
   * @returns {readonly DCCNEvent[]}
   */
  get events() {
    return Object.freeze([...this.#events]);
  }

  /**
   * Verify hash-chain integrity.
   * @returns {Promise<{ valid: boolean, errors: string[] }>}
   */
  async verify() {
    const { sha256 } = await import('./hash.js');
    const sorted = [...this.#events].sort(
      (a, b) => a.timestampLogical - b.timestampLogical
    );
    const errors = [];
    for (let i = 0; i < sorted.length; i++) {
      const ev = sorted[i];
      const body = {
        type: ev.type,
        payload: ev.payload,
        parent: ev.parent,
        timestampLogical: ev.timestampLogical,
      };
      const expectedHash = await canonicalHash(body, sha256);
      if (ev.hash !== expectedHash) {
        errors.push(`Event ${ev.cid}: hash mismatch at logical time ${ev.timestampLogical}`);
      }
      if (i > 0) {
        const expectedParent = sorted[i - 1].cid;
        if (!ev.parent.includes(expectedParent)) {
          errors.push(`Event ${ev.cid}: broken parent link at logical time ${ev.timestampLogical}`);
        }
      }
    }
    return { valid: errors.length === 0, errors };
  }

  /**
   * Reset the log to empty.
   */
  reset() {
    this.#events = [];
  }

  /**
   * Export as a plain array for serialization.
   * @returns {DCCNEvent[]}
   */
  export() {
    return [...this.#events];
  }

  /**
   * Import events from a snapshot (does not re-verify).
   * @param {DCCNEvent[]} events
   */
  import(events) {
    this.#events = [...events];
  }

  get length() {
    return this.#events.length;
  }
}
