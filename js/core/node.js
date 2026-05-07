/**
 * DCCN — Deterministic Convergent Compute Network
 * Network Node.
 *
 * A DCCNNode combines:
 *   - An ObjectStore (content-addressable storage)
 *   - An EventLog (immutable, hash-chained)
 *   - A State (derived by replaying the log)
 *   - A Reducer (pure function: State × Event → State)
 *
 * The node enforces the full DCCN convergence contract:
 *   State(0)   = GenesisState
 *   State(n+1) = Reducer(State(n), Event(n))
 *   StateRoot  = Hash(Canonical({ eventCIDs[], objectCount }))
 *
 * Copyright (C) 2025 James Chapman <xhecarpenxer@gmail.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

'use strict';

import { ObjectStore } from './store.js';
import { EventLog } from './event.js';
import { genesisState, defaultReducer, replay, computeStateRoot } from './reducer.js';
import { sha256 } from './hash.js';
import { canonicalize, canonicalHash } from './canonical.js';
import { cidFromHash } from './cid.js';
import { diff } from './diff.js';

export class DCCNNode {
  #store;
  #log;
  #state;
  #reducer;

  /**
   * @param {{ reducer?: typeof defaultReducer }} [opts]
   */
  constructor(opts = {}) {
    this.#store = new ObjectStore();
    this.#log = new EventLog();
    this.#state = genesisState();
    this.#reducer = opts.reducer ?? defaultReducer;
  }

  // ─── Object Store ──────────────────────────────────────────────────────────

  /**
   * Store any JSON-serializable object by content address.
   * @param {unknown} obj
   * @returns {Promise<{ cid: string, hash: string }>}
   */
  async put(obj) {
    const result = await this.#store.put(obj);
    this.#state.objectCount = this.#store.size;
    return result;
  }

  /**
   * Retrieve a stored object by CID.
   * @param {string} cid
   * @returns {{ obj: unknown, hash: string } | undefined}
   */
  get(cid) {
    return this.#store.get(cid);
  }

  /**
   * Verify the integrity of a stored object.
   * @param {string} cid
   */
  async verify(cid) {
    return this.#store.verify(cid);
  }

  // ─── Event Log ─────────────────────────────────────────────────────────────

  /**
   * Append an event to the log and immediately apply it via the reducer.
   * Also auto-stores the event object in the object store.
   *
   * @param {string}  type
   * @param {unknown} payload
   * @returns {Promise<import('./event.js').DCCNEvent>}
   */
  async emit(type, payload) {
    const event = await this.#log.append(type, payload);
    await this.#store.put(event); // events are also content-addressed
    this.#state = this.#reducer(this.#state, event);
    this.#state.objectCount = this.#store.size;
    return event;
  }

  // ─── State ─────────────────────────────────────────────────────────────────

  /**
   * Replay the entire event log from genesis to recompute derived state.
   * This is the canonical truth derivation — always yields the same result.
   *
   * @returns {Promise<import('./reducer.js').DCCNState>}
   */
  async replay() {
    this.#state = await replay(
      this.#log.events,
      this.#store.size,
      this.#reducer
    );
    return this.#state;
  }

  /**
   * Current derived state (may be stale if events were imported externally).
   * Call replay() to guarantee freshness.
   *
   * @returns {import('./reducer.js').DCCNState}
   */
  get state() {
    return { ...this.#state };
  }

  /**
   * Compute and return the current Merkle state root.
   * @returns {Promise<string>}
   */
  async stateRoot() {
    const root = await computeStateRoot(
      this.#log.events.map(e => e.cid),
      this.#store.size
    );
    this.#state.stateRoot = root;
    return root;
  }

  // ─── Log ───────────────────────────────────────────────────────────────────

  /**
   * Immutable view of all events.
   * @returns {readonly import('./event.js').DCCNEvent[]}
   */
  get events() {
    return this.#log.events;
  }

  /**
   * Verify the integrity of the hash chain.
   * @returns {Promise<{ valid: boolean, errors: string[] }>}
   */
  async verifyChain() {
    return this.#log.verify();
  }

  // ─── Utilities ─────────────────────────────────────────────────────────────

  /**
   * Hash any string.
   * @param {string} input
   * @returns {Promise<string>}
   */
  async hash(input) {
    return sha256(input);
  }

  /**
   * Diff two stored objects.
   * @param {string} cidA
   * @param {string} cidB
   * @returns {import('./diff.js').DiffEntry[]}
   */
  diff(cidA, cidB) {
    const a = this.#store.get(cidA);
    const b = this.#store.get(cidB);
    if (!a) throw new Error(`diff: CID not found: ${cidA}`);
    if (!b) throw new Error(`diff: CID not found: ${cidB}`);
    return diff(a.obj, b.obj);
  }

  /**
   * Reset node to genesis state.
   */
  reset() {
    this.#store.clear();
    this.#log.reset();
    this.#state = genesisState();
  }

  /**
   * Export a full snapshot of the node (store + log).
   * @returns {{ store: object, log: import('./event.js').DCCNEvent[] }}
   */
  export() {
    return {
      store: this.#store.export(),
      log: this.#log.export(),
    };
  }

  /**
   * Import a snapshot. Does not re-verify — call verifyChain() after.
   * @param {{ store: object, log: import('./event.js').DCCNEvent[] }} snapshot
   */
  async import(snapshot) {
    this.reset();
    this.#store.import(snapshot.store ?? {});
    this.#log.import(snapshot.log ?? []);
    await this.replay();
  }
}
