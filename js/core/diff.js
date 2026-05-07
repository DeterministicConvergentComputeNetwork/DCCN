/**
 * DCCN — Deterministic Convergent Compute Network
 * Structural object diff.
 *
 * Compares two content-addressed objects field by field.
 * Returns a list of changed keys with before/after values.
 *
 * Copyright (C) 2025 James Chapman <xhecarpenxer@gmail.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

'use strict';

/**
 * @typedef {Object} DiffEntry
 * @property {string}  key
 * @property {unknown} a    Value in object A (undefined if missing)
 * @property {unknown} b    Value in object B (undefined if missing)
 * @property {'added'|'removed'|'changed'} kind
 */

/**
 * Shallow structural diff of two plain objects.
 *
 * @param {Record<string, unknown>} objA
 * @param {Record<string, unknown>} objB
 * @returns {DiffEntry[]}
 */
export function diff(objA, objB) {
  const keysA = Object.keys(objA ?? {});
  const keysB = Object.keys(objB ?? {});
  const allKeys = new Set([...keysA, ...keysB]);
  const changes = [];

  for (const key of allKeys) {
    const va = JSON.stringify(objA?.[key]);
    const vb = JSON.stringify(objB?.[key]);
    if (va === vb) continue;

    let kind;
    if (!(key in (objA ?? {}))) kind = 'added';
    else if (!(key in (objB ?? {}))) kind = 'removed';
    else kind = 'changed';

    changes.push({ key, a: objA?.[key], b: objB?.[key], kind });
  }

  return changes;
}

/**
 * Returns true if two objects are structurally identical
 * (i.e., same canonical hash).
 *
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
export function isConvergent(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
