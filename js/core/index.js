/**
 * DCCN — Deterministic Convergent Compute Network
 * Core module exports
 * Copyright (C) 2025 James Chapman <xhecarpenxer@gmail.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export { canonicalize, canonicalJSON, canonicalHash } from './canonical.js';
export { sha256 } from './hash.js';
export { cidFromHash, isCID } from './cid.js';
export { DCCNNode } from './node.js';
export { ObjectStore } from './store.js';
export { DCCNReducer, applyEvent, replayEvents, computeStateRoot } from './reducer.js';
export { diffObjects } from './diff.js';
