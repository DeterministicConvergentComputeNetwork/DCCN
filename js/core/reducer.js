/**
 * DCCN — Deterministic Convergent Compute Network
 * Reducer & State Machine.
 *
 * The core DCCN law:
 *
 *   State(0)   = GenesisState
 *   State(n+1) = Reducer(State(n), Event(n))
 *   StateRoot  = Hash(Canonical({ eventCIDs, objectCount }))
 *
 * The reducer is a pure function:
 *   (State, Event) → State'
 *
 * Replaying the full event log from genesis always yields the same
 * derived state — this is the Deterministic Convergence guarantee.
 *
 * Copyright (C) 2025 James Chapman <xhecarpenxer@gmail.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

'use strict';

import { sha256 } from './hash.js';
import { canonicalize, canonicalJSON } from './canonical.js';
import { cidFromHash } from './cid.js';

/**
 * @typedef {Object} DCCNState
 * @property {string}                stateRoot       Merkle state root hash
 * @property {number}                eventCount      Total events applied
 * @property {number}                objectCount     Total objects in store
 * @property {Record<string,number>} byType          Event counts per type
 * @property {unknown[]}             payloads        All payloads in order
 * @property {string|null}           lastEventCid
 * @property {string|null}           lastEventType
 * @property {number|null}           lastEventLogical
 */

/** @returns {DCCNState} */
export function genesisState() {
  return {
    stateRoot: '0'.repeat(64),
    eventCount: 0,
    objectCount: 0,
    byType: {},
    payloads: [],
    lastEventCid: null,
    lastEventType: null,
    lastEventLogical: null,
  };
}

/**
 * The default DCCN reducer.
 * Pure function — does not mutate either argument.
 *
 * @param {DCCNState} state
 * @param {import('./event.js').DCCNEvent} event
 * @returns {DCCNState}
 */
export function defaultReducer(state, event) {
  const byType = { ...state.byType };
  byType[event.type] = (byType[event.type] ?? 0) + 1;

  return {
    ...state,
    eventCount: state.eventCount + 1,
    byType,
    payloads: [...(state.payloads ?? []), event.payload],
    lastEventCid: event.cid,
    lastEventType: event.type,
    lastEventLogical: event.timestampLogical,
  };
}

/**
 * Replay all events from genesis using the given reducer, producing
 * a fully derived state.  The final stateRoot is computed from the
 * ordered CID list and the objectCount.
 *
 * @param {import('./event.js').DCCNEvent[]} events  In logical-time order
 * @param {number}                            objectCount
 * @param {typeof defaultReducer}             [reducer]
 * @returns {Promise<DCCNState>}
 */
export async function replay(events, objectCount = 0, reducer = defaultReducer) {
  const sorted = [...events].sort(
    (a, b) => a.timestampLogical - b.timestampLogical
  );

  let state = { ...genesisState(), objectCount };

  for (const event of sorted) {
    state = reducer(state, event);
  }

  // Compute Merkle state root
  const rootInput = canonicalJSON({
    events: sorted.map(e => e.cid),
    objectCount: state.objectCount,
  });
  state.stateRoot = await sha256(rootInput);

  return state;
}

/**
 * Apply a single event to the current state and return the new state.
 * Convenience wrapper around the default reducer.
 *
 * @param {DCCNState}                         state
 * @param {import('./event.js').DCCNEvent}    event
 * @param {typeof defaultReducer}             [reducer]
 * @returns {DCCNState}
 */
export function applyEvent(state, event, reducer = defaultReducer) {
  return reducer(state, event);
}

/**
 * Compute the Merkle state root for a set of event CIDs and an object count.
 *
 * @param {string[]} eventCIDs
 * @param {number}   objectCount
 * @returns {Promise<string>}
 */
export async function computeStateRoot(eventCIDs, objectCount) {
  const input = canonicalJSON({ events: eventCIDs, objectCount });
  return sha256(input);
}
