var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// utils/hex.js
function bytesToHex(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}
function hexToBytes(hex) {
  if (hex.length % 2 !== 0)
    throw new Error("Invalid hex string length");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
var init_hex = __esm({
  "utils/hex.js"() {
    "use strict";
  }
});

// utils/encode.js
function encodeUTF8(str) {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(str);
  }
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code >= 55296 && code <= 56319 && i + 1 < str.length) {
      const hi = code;
      const lo = str.charCodeAt(i + 1);
      if (lo >= 56320 && lo <= 57343) {
        code = 65536 + (hi - 55296 << 10) + (lo - 56320);
        i++;
      }
    }
    if (code < 128) {
      bytes.push(code);
    } else if (code < 2048) {
      bytes.push(192 | code >> 6, 128 | code & 63);
    } else if (code < 65536) {
      bytes.push(
        224 | code >> 12,
        128 | code >> 6 & 63,
        128 | code & 63
      );
    } else {
      bytes.push(
        240 | code >> 18,
        128 | code >> 12 & 63,
        128 | code >> 6 & 63,
        128 | code & 63
      );
    }
  }
  return new Uint8Array(bytes);
}
var init_encode = __esm({
  "utils/encode.js"() {
    "use strict";
  }
});

// utils/index.js
var init_utils = __esm({
  "utils/index.js"() {
    init_hex();
    init_encode();
  }
});

// core/hash.js
var hash_exports = {};
__export(hash_exports, {
  sha256: () => sha256,
  sha256PureJS: () => sha256PureJS,
  sha256Sync: () => sha256Sync
});
function rotr32(x, n) {
  return x >>> n | x << 32 - n;
}
function sha256PureJS(data) {
  const len = data.length;
  const bitLen = len * 8;
  const padLen = len + 9 + 63 & ~63;
  const padded = new Uint8Array(padLen);
  padded.set(data);
  padded[len] = 128;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padLen - 4, bitLen >>> 0, false);
  dv.setUint32(padLen - 8, Math.floor(bitLen / 4294967296), false);
  let h0 = 1779033703, h1 = 3144134277, h2 = 1013904242, h3 = 2773480762;
  let h4 = 1359893119, h5 = 2600822924, h6 = 528734635, h7 = 1541459225;
  const w = new Uint32Array(64);
  for (let off = 0; off < padLen; off += 64) {
    const chunk = new DataView(padded.buffer, off, 64);
    for (let i = 0; i < 16; i++)
      w[i] = chunk.getUint32(i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr32(w[i - 15], 7) ^ rotr32(w[i - 15], 18) ^ w[i - 15] >>> 3;
      const s1 = rotr32(w[i - 2], 17) ^ rotr32(w[i - 2], 19) ^ w[i - 2] >>> 10;
      w[i] = w[i - 16] + s0 + w[i - 7] + s1 >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
      const ch = e & f ^ ~e & g;
      const temp1 = h + S1 + ch + K[i] + w[i] >>> 0;
      const S0 = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
      const maj = a & b ^ a & c ^ b & c;
      const temp2 = S0 + maj >>> 0;
      h = g;
      g = f;
      f = e;
      e = d + temp1 >>> 0;
      d = c;
      c = b;
      b = a;
      a = temp1 + temp2 >>> 0;
    }
    h0 = h0 + a >>> 0;
    h1 = h1 + b >>> 0;
    h2 = h2 + c >>> 0;
    h3 = h3 + d >>> 0;
    h4 = h4 + e >>> 0;
    h5 = h5 + f >>> 0;
    h6 = h6 + g >>> 0;
    h7 = h7 + h >>> 0;
  }
  const out = new Uint8Array(32);
  const odv = new DataView(out.buffer);
  odv.setUint32(0, h0, false);
  odv.setUint32(4, h1, false);
  odv.setUint32(8, h2, false);
  odv.setUint32(12, h3, false);
  odv.setUint32(16, h4, false);
  odv.setUint32(20, h5, false);
  odv.setUint32(24, h6, false);
  odv.setUint32(28, h7, false);
  return bytesToHex(out);
}
async function tryLoadNodeCrypto() {
  if (_nodeCryptoAttempted)
    return _nodeCrypto;
  _nodeCryptoAttempted = true;
  try {
    const mod = await import("node:crypto");
    _nodeCrypto = mod.default || mod;
  } catch {
    _nodeCrypto = null;
  }
  return _nodeCrypto;
}
async function sha256(input) {
  const bytes = encodeUTF8(input);
  if (typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.subtle) {
    const buf = await globalThis.crypto.subtle.digest("SHA-256", bytes);
    return bytesToHex(new Uint8Array(buf));
  }
  const nodeCrypto = await tryLoadNodeCrypto();
  if (nodeCrypto && nodeCrypto.createHash) {
    const hash2 = nodeCrypto.createHash("sha256");
    hash2.update(bytes);
    return hash2.digest("hex");
  }
  return sha256PureJS(bytes);
}
function sha256Sync(input) {
  return sha256PureJS(encodeUTF8(input));
}
var K, _nodeCrypto, _nodeCryptoAttempted;
var init_hash = __esm({
  "core/hash.js"() {
    "use strict";
    init_utils();
    K = new Uint32Array([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
    _nodeCrypto = null;
    _nodeCryptoAttempted = false;
  }
});

// index.js
var js_exports = {};
__export(js_exports, {
  DCCNNode: () => DCCNNode,
  EventLog: () => EventLog,
  ObjectStore: () => ObjectStore,
  applyEvent: () => applyEvent,
  buildEvent: () => buildEvent,
  bytesToHex: () => bytesToHex,
  canonicalHash: () => canonicalHash,
  canonicalJSON: () => canonicalJSON,
  canonicalize: () => canonicalize,
  cidFromHash: () => cidFromHash,
  computeStateRoot: () => computeStateRoot,
  defaultReducer: () => defaultReducer,
  diff: () => diff,
  encodeUTF8: () => encodeUTF8,
  genesisState: () => genesisState,
  hash: () => hash,
  hashFromCID: () => hashFromCID,
  hexToBytes: () => hexToBytes,
  init: () => init,
  isCID: () => isCID,
  isConvergent: () => isConvergent,
  replay: () => replay,
  run: () => run,
  sha256: () => sha256,
  sha256PureJS: () => sha256PureJS,
  sha256Sync: () => sha256Sync
});
module.exports = __toCommonJS(js_exports);

// core/canonical.js
function canonicalize(value) {
  if (value === null || typeof value !== "object")
    return value;
  if (Array.isArray(value))
    return value.map(canonicalize);
  return Object.keys(value).sort().reduce((acc, k) => {
    acc[k] = canonicalize(value[k]);
    return acc;
  }, {});
}
function canonicalJSON(value) {
  return JSON.stringify(canonicalize(value));
}
async function canonicalHash(value, hashFn) {
  return hashFn(canonicalJSON(value));
}

// core/index.js
init_hash();

// core/cid.js
var CID_PREFIX = "bafy";
var CID_HASH_LEN = 44;
function cidFromHash(hexDigest) {
  if (typeof hexDigest !== "string" || hexDigest.length < CID_HASH_LEN) {
    throw new Error(`cidFromHash: expected at least ${CID_HASH_LEN}-char hex, got: ${hexDigest}`);
  }
  return CID_PREFIX + hexDigest.slice(0, CID_HASH_LEN);
}
function hashFromCID(cid) {
  if (!cid.startsWith(CID_PREFIX)) {
    throw new Error(`hashFromCID: not a DCCN CID: ${cid}`);
  }
  return cid.slice(CID_PREFIX.length);
}
function isCID(value) {
  return typeof value === "string" && value.startsWith(CID_PREFIX) && value.length === CID_PREFIX.length + CID_HASH_LEN;
}

// core/store.js
init_hash();
var ObjectStore = class {
  /** @type {Map<string, StoreEntry>} */
  #store = /* @__PURE__ */ new Map();
  /**
   * Store an object by content-address.
   * Returns the CID and hash of the stored object.
   *
   * @param {unknown} obj
   * @returns {Promise<{ cid: string, hash: string }>}
   */
  async put(obj) {
    const hash2 = await canonicalHash(obj, sha256);
    const cid = cidFromHash(hash2);
    if (!this.#store.has(cid)) {
      this.#store.set(cid, { obj, hash: hash2 });
    }
    return { cid, hash: hash2 };
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
    if (!entry)
      throw new Error(`verify: CID not found: ${cid}`);
    const recomputedHash = await canonicalHash(entry.obj, sha256);
    const recomputedCID = cidFromHash(recomputedHash);
    return {
      valid: recomputedHash === entry.hash,
      storedHash: entry.hash,
      recomputedHash,
      cidMatch: recomputedCID === cid
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
};

// core/event.js
var GENESIS_PARENT = "genesis";
async function buildEvent(eventType, payload, parentCids, logicalTime) {
  const canonicalPayload = canonicalize(payload);
  const body = {
    type: eventType,
    payload: canonicalPayload,
    parent: parentCids,
    timestampLogical: logicalTime
  };
  const hash2 = await canonicalHash(body, async (s) => {
    const { sha256: sha2562 } = await Promise.resolve().then(() => (init_hash(), hash_exports));
    return sha2562(s);
  });
  const cid = cidFromHash(hash2);
  return Object.freeze({
    type: eventType,
    payload: canonicalPayload,
    parent: parentCids,
    timestampLogical: logicalTime,
    hash: hash2,
    cid
  });
}
var EventLog = class {
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
    const parentCids = this.#events.length > 0 ? [this.#events[this.#events.length - 1].cid] : [GENESIS_PARENT];
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
    const { sha256: sha2562 } = await Promise.resolve().then(() => (init_hash(), hash_exports));
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
        timestampLogical: ev.timestampLogical
      };
      const expectedHash = await canonicalHash(body, sha2562);
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
};

// core/reducer.js
init_hash();
function genesisState() {
  return {
    stateRoot: "0".repeat(64),
    eventCount: 0,
    objectCount: 0,
    byType: {},
    payloads: [],
    lastEventCid: null,
    lastEventType: null,
    lastEventLogical: null
  };
}
function defaultReducer(state, event) {
  const byType = { ...state.byType };
  byType[event.type] = (byType[event.type] ?? 0) + 1;
  return {
    ...state,
    eventCount: state.eventCount + 1,
    byType,
    payloads: [...state.payloads ?? [], event.payload],
    lastEventCid: event.cid,
    lastEventType: event.type,
    lastEventLogical: event.timestampLogical
  };
}
async function replay(events, objectCount = 0, reducer = defaultReducer) {
  const sorted = [...events].sort(
    (a, b) => a.timestampLogical - b.timestampLogical
  );
  let state = { ...genesisState(), objectCount };
  for (const event of sorted) {
    state = reducer(state, event);
  }
  const rootInput = canonicalJSON({
    events: sorted.map((e) => e.cid),
    objectCount: state.objectCount
  });
  state.stateRoot = await sha256(rootInput);
  return state;
}
function applyEvent(state, event, reducer = defaultReducer) {
  return reducer(state, event);
}
async function computeStateRoot(eventCIDs, objectCount) {
  const input = canonicalJSON({ events: eventCIDs, objectCount });
  return sha256(input);
}

// core/node.js
init_hash();

// core/diff.js
function diff(objA, objB) {
  const keysA = Object.keys(objA ?? {});
  const keysB = Object.keys(objB ?? {});
  const allKeys = /* @__PURE__ */ new Set([...keysA, ...keysB]);
  const changes = [];
  for (const key of allKeys) {
    const va = JSON.stringify(objA?.[key]);
    const vb = JSON.stringify(objB?.[key]);
    if (va === vb)
      continue;
    let kind;
    if (!(key in (objA ?? {})))
      kind = "added";
    else if (!(key in (objB ?? {})))
      kind = "removed";
    else
      kind = "changed";
    changes.push({ key, a: objA?.[key], b: objB?.[key], kind });
  }
  return changes;
}
function isConvergent(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// core/node.js
var DCCNNode = class {
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
    await this.#store.put(event);
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
      this.#log.events.map((e) => e.cid),
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
    if (!a)
      throw new Error(`diff: CID not found: ${cidA}`);
    if (!b)
      throw new Error(`diff: CID not found: ${cidB}`);
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
      log: this.#log.export()
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
};

// index.js
init_utils();
function init(config) {
  return { status: "initialized", config };
}
function run({ payload }) {
  return {
    deterministic: true,
    input: payload,
    output: `processed:${payload}`
  };
}
function hash(input) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return "dccn_" + Math.abs(h).toString(16);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DCCNNode,
  EventLog,
  ObjectStore,
  applyEvent,
  buildEvent,
  bytesToHex,
  canonicalHash,
  canonicalJSON,
  canonicalize,
  cidFromHash,
  computeStateRoot,
  defaultReducer,
  diff,
  encodeUTF8,
  genesisState,
  hash,
  hashFromCID,
  hexToBytes,
  init,
  isCID,
  isConvergent,
  replay,
  run,
  sha256,
  sha256PureJS,
  sha256Sync
});
