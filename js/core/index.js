/**
 * DCCN — Deterministic Convergent Compute Network
 * Core module barrel export.
 *
 * Copyright (C) 2025 James Chapman <xhecarpenxer@gmail.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export { canonicalize, canonicalJSON, canonicalHash } from './canonical.js';
export { sha256, sha256Sync, sha256PureJS } from './hash.js';
export { cidFromHash, hashFromCID, isCID } from './cid.js';
export { DCCNNode } from './node.js';
export { ObjectStore } from './store.js';
export { EventLog, buildEvent } from './event.js';
export {
  genesisState,
  defaultReducer,
  applyEvent,
  replay,
  computeStateRoot,
} from './reducer.js';
export { diff, isConvergent } from './diff.js';
