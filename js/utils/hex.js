/**
 * DCCN — Deterministic Convergent Compute Network
 * Hex encoding utilities
 *
 * Copyright (C) 2025 James Chapman <xhecarpenxer@gmail.com>
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * This file is part of DCCN.
 *
 * DCCN is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * DCCN is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along
 * with DCCN. If not, see <https://www.gnu.org/licenses/>.
 */

'use strict';

/**
 * Convert a Uint8Array (or any byte array) to a lowercase hex string.
 * Pure JS — no runtime-specific APIs.
 *
 * @param {Uint8Array|number[]} bytes
 * @returns {string}
 */
export function bytesToHex(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0');
  }
  return out;
}

/**
 * Convert a hex string to a Uint8Array.
 *
 * @param {string} hex
 * @returns {Uint8Array}
 */
export function hexToBytes(hex) {
  if (hex.length % 2 !== 0) throw new Error('Invalid hex string length');
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
