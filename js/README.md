# @dccn/dccn

JavaScript/Node.js implementation of the **Deterministic Convergent Compute Network**.

DCCN provides content-addressed storage, immutable hash-chained event logs, and pure-function state machines that always converge to the same state regardless of replay order.

## Install

```bash
npm install @dccn/dccn
```

No runtime dependencies. Works in Node.js ≥ 16, modern browsers, Deno, Bun, and Cloudflare Workers.

## Quick Start

```javascript
import { DCCNNode } from '@dccn/dccn';

const node = new DCCNNode();

// Store a content-addressed object
const { cid } = await node.put({ hello: 'world' });
console.log(cid); // bafyd807aa98243185be550c7dc372be5d7480deb1fe9bdc06a7...

// Emit hash-chained events
await node.emit('user.created', { id: 42, name: 'Alice' });
await node.emit('user.updated', { id: 42, name: 'Alice Smith' });

// Derive Merkle state root (deterministic)
const root = await node.stateRoot();
console.log(root); // 64-char hex

// Verify the entire event chain
const { valid } = await node.verifyChain();
console.log(valid); // true
```

## API

### `DCCNNode`

The top-level object combining content-addressed storage, an event log, and a reducer-driven state machine.

```javascript
import { DCCNNode } from '@dccn/dccn';

const node = new DCCNNode();
// or: new DCCNNode({ reducer: myCustomReducer })
```

#### Object store

```javascript
const { cid, hash } = await node.put(anyJsonValue);
const entry = node.get(cid);           // { obj, hash }
const result = await node.verify(cid); // { valid, storedHash, recomputedHash, cidMatch }
```

#### Event log

```javascript
const event = await node.emit('event.type', payload);
// event: { type, payload, parent, timestampLogical, hash, cid }

node.events;                         // readonly DCCNEvent[]
const { valid, errors } = await node.verifyChain();
```

#### State machine

```javascript
node.state;                  // current DCCNState (snapshot)
await node.replay();         // recompute state from genesis
const root = await node.stateRoot(); // Merkle root hex string
```

`DCCNState` shape:
```typescript
{
  stateRoot: string;           // Merkle state root
  eventCount: number;
  objectCount: number;
  byType: Record<string, number>;
  payloads: unknown[];
  lastEventCid: string | null;
  lastEventType: string | null;
  lastEventLogical: number | null;
}
```

#### Snapshot / restore

```javascript
const snapshot = node.export();        // { store, log }
await node.import(snapshot);           // reset + replay
node.reset();                          // back to genesis
```

---

### `ObjectStore`

Content-addressable in-memory store you can use standalone.

```javascript
import { ObjectStore } from '@dccn/dccn';

const store = new ObjectStore();
const { cid, hash } = await store.put({ x: 1 });
const entry = store.get(cid);     // { obj, hash } | undefined
const ok = store.has(cid);
await store.verify(cid);          // { valid, storedHash, recomputedHash, cidMatch }
store.size;                       // number
store.keys();                     // IterableIterator<string>
store.export();                   // plain object snapshot
store.import(snapshot);
store.clear();
```

---

### `EventLog`

Append-only, hash-chained event log.

```javascript
import { EventLog } from '@dccn/dccn';

const log = new EventLog();
const event = await log.append('transfer', { amount: 100 });
log.events;                       // readonly DCCNEvent[]
log.length;
const { valid, errors } = await log.verify();
log.export();
log.import(events);
log.reset();
```

---

### Hashing

```javascript
import { sha256, sha256Sync, sha256PureJS } from '@dccn/dccn';

await sha256('hello');     // async, uses fastest available (WebCrypto / node:crypto / pure-JS)
sha256Sync('hello');       // synchronous pure-JS fallback
sha256PureJS(uint8Array);  // pure-JS, takes Uint8Array, returns 64-char hex
```

---

### Canonicalization

```javascript
import { canonicalize, canonicalJSON, canonicalHash } from '@dccn/dccn';

// Deep-sort all object keys (RFC 8785 compatible subset)
canonicalize({ b: 2, a: 1 });       // { a: 1, b: 2 }

// Deterministic JSON string
canonicalJSON({ b: 2, a: 1 });      // '{"a":1,"b":2}'

// Hash a value via any async hash function
await canonicalHash({ b: 2, a: 1 }, sha256); // 64-char hex
```

The DCCN identity invariant:
```
Identity(x) = SHA-256(CanonicalJSON(x))
```

---

### CIDs (Content Identifiers)

```javascript
import { cidFromHash, hashFromCID, isCID } from '@dccn/dccn';

const cid = cidFromHash(hexDigest);  // 'bafy' + first 44 hex chars
hashFromCID(cid);                    // recover the 44-char hash fragment
isCID(value);                        // boolean
```

---

### Reducer utilities

```javascript
import {
  genesisState,
  defaultReducer,
  applyEvent,
  replay,
  computeStateRoot
} from '@dccn/dccn';

// Build your own state machine
const state0 = genesisState();
const state1 = applyEvent(state0, event);

// Replay a full event array from genesis
const finalState = await replay(events, objectCount, myReducer);

// Compute a Merkle root from CID list + object count
const root = await computeStateRoot(cidList, objectCount);
```

---

### Structural diff

```javascript
import { diff, isConvergent } from '@dccn/dccn';

diff({ a: 1, b: 2 }, { a: 1, b: 3 });
// [{ key: 'b', a: 2, b: 3, kind: 'changed' }]

isConvergent(objA, objB); // true if structurally identical
```

---

### Utilities

```javascript
import { bytesToHex, hexToBytes, encodeUTF8 } from '@dccn/dccn';
// or: import { bytesToHex, hexToBytes, encodeUTF8 } from '@dccn/dccn/utils'
```

---

## CLI

```bash
npx @dccn/dccn help
npx @dccn/dccn version
npx @dccn/dccn hash "some input"
npx @dccn/dccn run "some payload"
```

---

## Determinism guarantee

DCCN enforces that replaying the same event log from genesis **always** produces the same state root:

```javascript
const node = new DCCNNode();
await node.emit('ping', { value: 1 });
await node.emit('ping', { value: 2 });

const root1 = await node.stateRoot();
await node.replay();
const root2 = await node.stateRoot();

console.assert(root1 === root2); // always true
```

---

## Custom reducer

```javascript
import { DCCNNode } from '@dccn/dccn';

function counterReducer(state, event) {
  if (event.type === 'increment') {
    return { ...state, count: (state.count ?? 0) + (event.payload.by ?? 1) };
  }
  return state;
}

const node = new DCCNNode({ reducer: counterReducer });
await node.emit('increment', { by: 5 });
await node.emit('increment', { by: 3 });
console.log(node.state.count); // 8
```

---

## Building

```bash
npm run build    # produces dist/index.cjs (CommonJS bundle via esbuild)
```

## Testing

```bash
npm test
npm run test:coverage
```

## Browser support

- Chrome/Edge 90+, Firefox 88+, Safari 14+
- Uses `WebCrypto.subtle` for hashing when available; falls back to pure-JS SHA-256 with no external dependencies.

## License

GPL-3.0-or-later — see [LICENSE](./LICENSE).

© 2025–2026 James Chapman <xhecarpenxer@gmail.com>