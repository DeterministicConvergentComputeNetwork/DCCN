# DCCN JavaScript Package

JavaScript/Node.js implementation of the Deterministic Convergent Compute Network.

## Installation

### From NPM (coming soon)

```bash
npm install dccn
```

### From Source

```bash
git clone https://github.com/yourusername/DCCN.git
cd DCCN/js
npm install
```

## Quick Start

### Basic Usage

```javascript
import { canonicalHash, makeCID } from 'dccn';

// Canonical hashing (order-independent)
const hash1 = canonicalHash({ b: 2, a: 1 });
const hash2 = canonicalHash({ a: 1, b: 2 });
console.assert(hash1 === hash2);  // ✓ True

// Create content identifier
const cid = makeCID(hash1);
console.log(`CID: ${cid}`);
```

### Event Log

```javascript
import { EventLog, MemoryStore } from 'dccn';

// Create event log with in-memory storage
const log = new EventLog(new MemoryStore());

// Add events
const event1 = log.addEvent('start', { name: 'process' });
const event2 = log.addEvent('complete', { status: 'success' });

// Get current state
const state = log.getState();
console.log(`Events: ${state.eventCount}`);
console.log(`State Root: ${state.stateRoot}`);
```

### Reducers for State Management

```javascript
import { Reducer, Event } from 'dccn';

function counterReducer(state, event) {
  if (event.type === 'increment') {
    return { count: (state.count || 0) + event.amount };
  } else if (event.type === 'decrement') {
    return { count: (state.count || 0) - event.amount };
  } else if (event.type === 'reset') {
    return { count: 0 };
  }
  return state;
}

// Initialize reducer
const reducer = new Reducer(counterReducer);

// Apply events
const initial = { count: 0 };
const state1 = reducer.applyEvent(initial, new Event('increment', { amount: 5 }));
const state2 = reducer.applyEvent(state1, new Event('increment', { amount: 3 }));
console.assert(state2.count === 8);  // ✓ True
```

### Using in Browser

```html
<script type="module">
  import { canonicalHash, makeCID } from './js/index.js';
  
  const hash = canonicalHash({ data: 'test' });
  console.log(`Hash: ${hash}`);
</script>
```

## API Reference

### Core Hashing

#### `canonicalHash(data) -> string`
Generate deterministic SHA256 hash of any JavaScript object.

**Parameters:**
- `data` (any) - Object to hash (object, array, string, number, etc.)

**Returns:**
- `string` - 64-character hexadecimal hash

**Example:**
```javascript
import { canonicalHash } from 'dccn';

const hash = canonicalHash({ key: 'value' });
// hash = 'e2d0...'
```

#### `canonicalJson(data) -> string`
Get canonical JSON representation (sorted keys, no extra whitespace).

**Parameters:**
- `data` (any) - Object to serialize

**Returns:**
- `string` - Canonical JSON string

#### `sha256Str(str) -> string`
Hash a string directly.

**Parameters:**
- `str` (string) - String to hash

**Returns:**
- `string` - 64-character hexadecimal hash

#### `sha256Bytes(bytes) -> string`
Hash bytes directly (using SubtleCrypto or crypto module).

**Parameters:**
- `bytes` (Uint8Array | Buffer) - Bytes to hash

**Returns:**
- `string` - 64-character hexadecimal hash

### Content Addressing

#### `makeCID(hash, metadata = {}) -> string`
Create a content identifier from a hash.

**Parameters:**
- `hash` (string) - Hash to create CID from
- `metadata` (object, optional) - Metadata to include

**Returns:**
- `string` - Content identifier

**Example:**
```javascript
import { makeCID } from 'dccn';

const hash = 'abc123def456...';
const cid = makeCID(hash);
// cid = 'a1b2c3d4-...'
```

#### `cidToHashPrefix(cid) -> string`
Extract hash from a content identifier.

**Parameters:**
- `cid` (string) - Content identifier

**Returns:**
- `string` - Hash prefix

#### `isValidCID(cid) -> boolean`
Validate CID format.

**Parameters:**
- `cid` (string) - String to validate

**Returns:**
- `boolean` - True if valid CID format

### Event Management

#### `Event` Class

Represents a state change event.

**Constructor:**
```javascript
new Event(type, payload, timestamp = null, parentHash = null)
```

**Properties:**
- `type` (string) - Event type/action name
- `payload` (object) - Event data
- `timestamp` (number) - Unix timestamp
- `parentHash` (string) - Hash of previous state

**Methods:**
- `toJSON()` - Convert to JSON representation
- `hash()` - Get event hash
- `equals(other)` - Compare events

#### `EventLog` Class

Immutable append-only event log.

**Constructor:**
```javascript
new EventLog(store)
```

**Methods:**
- `addEvent(type, payload) -> Event` - Add event to log
- `getState() -> object` - Get current state
- `getEvent(hash) -> Event` - Get event by hash
- `getEvents(start = 0, end = null) -> Event[]` - Get events in range
- `verify() -> boolean` - Verify log integrity
- `replay(reducer, initialState) -> object` - Replay events through reducer

**Example:**
```javascript
import { EventLog, MemoryStore } from 'dccn';

const log = new EventLog(new MemoryStore());
const event = log.addEvent('test', { data: 'value' });
const state = log.getState();
```

### Reducers

#### `Reducer` Class

Applies events to state using a pure function.

**Constructor:**
```javascript
new Reducer(fn)
```

**Parameters:**
- `fn` (function) - Function with signature `(state, event) -> state`

**Methods:**
- `applyEvent(state, event) -> object` - Apply single event
- `applyEvents(state, events) -> object` - Apply multiple events

**Example:**
```javascript
import { Reducer, Event } from 'dccn';

function myReducer(state, event) {
  if (event.type === 'set') {
    return { ...state, ...event.payload };
  }
  return state;
}

const reducer = new Reducer(myReducer);
const newState = reducer.applyEvent({}, new Event('set', { x: 1 }));
```

#### `defaultReducer` Function

Built-in identity reducer (returns state unchanged).

```javascript
import { defaultReducer } from 'dccn';
```

### Storage

#### `MemoryStore` Class

In-memory storage for events (suitable for testing).

```javascript
import { MemoryStore } from 'dccn';

const store = new MemoryStore();
```

**Methods:**
- `add(key, value)` - Add item
- `get(key)` - Retrieve item
- `all() -> object[]` - Get all items
- `clear()` - Clear storage
- `size` - Number of items

#### `FileStore` Class (Node.js only)

Persistent file-based storage.

```javascript
import { FileStore } from 'dccn';

const store = new FileStore('./data');  // Creates directory if needed
```

**Methods:**
- `add(key, value)` - Write to file
- `get(key)` - Read from file
- `all() -> object[]` - List all files
- `delete(key)` - Remove file

## Usage Patterns

### Todo App with Reducer

```javascript
import { Reducer, EventLog, MemoryStore, Event } from 'dccn';

function todoReducer(state = {}, event) {
  if (event.type === 'add-todo') {
    return {
      ...state,
      todos: [
        ...(state.todos || []),
        { id: event.id, text: event.text, done: false }
      ]
    };
  }
  
  if (event.type === 'toggle-todo') {
    return {
      ...state,
      todos: state.todos.map(t =>
        t.id === event.id ? { ...t, done: !t.done } : t
      )
    };
  }
  
  return state;
}

// Create reducer and event log
const reducer = new Reducer(todoReducer);
const log = new EventLog(new MemoryStore());

// Add events
log.addEvent('add-todo', { id: '1', text: 'Learn DCCN' });
log.addEvent('add-todo', { id: '2', text: 'Build app' });
log.addEvent('toggle-todo', { id: '1' });

// Get final state
const state = log.getState();
console.log(state.todos);
```

### Verifying Determinism

```javascript
import { canonicalHash, canonicalJson } from 'dccn';

// These all produce the same hash
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 2, a: 1 };
const obj3 = JSON.parse(JSON.stringify(obj1));

const h1 = canonicalHash(obj1);
const h2 = canonicalHash(obj2);
const h3 = canonicalHash(obj3);

console.assert(h1 === h2 && h2 === h3);  // ✓ Always true
```

## Testing

Run the test suite:

```bash
npm test                 # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report
```

## Linting & Formatting

```bash
npm run lint           # Check code style
npm run format         # Auto-format code
```

## Building

Build for multiple environments:

```bash
npm run build          # Create CommonJS and ES modules
```

## Browser Support

The package works in modern browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Node.js 16+

Use the SubtleCrypto API for browser hashing (no external dependencies required).

## TypeScript

Type definitions are included. Use in TypeScript:

```typescript
import { canonicalHash, EventLog, MemoryStore } from 'dccn';

const hash: string = canonicalHash({ x: 1 });
const log: EventLog = new EventLog(new MemoryStore());
```

## Performance

Benchmarks on typical operations:

- Hashing 1MB object: ~50ms (browser), ~5ms (Node.js)
- Creating 1000 events: ~100ms
- Verifying log of 10000 events: ~200ms

See `benchmarks/` for detailed performance tests.

## Architecture

The JavaScript implementation follows this structure:

```
js/
├── index.js           # Main entry point
├── core/              # Core algorithms
│   ├── hash.js
│   ├── canonicalize.js
│   ├── cid.js
│   ├── event.js
│   ├── reducer.js
│   ├── store.js
│   └── index.js
├── utils/             # Utility functions
│   └── index.js
├── dist/              # Compiled output
│   ├── index.cjs      # CommonJS build
│   ├── index.js       # ES modules build
│   └── index.d.ts     # TypeScript definitions
└── tests/             # Test suite
```

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Run `npm test` and ensure all tests pass
5. Run `npm run format` for code style
6. Submit a pull request

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

## License

GPL-3.0-or-later. See [LICENSE](../../LICENSE) for details.

## Support

- **Issues**: https://github.com/yourusername/DCCN/issues
- **Discussions**: https://github.com/yourusername/DCCN/discussions
- **Email**: xhecarpenxer@gmail.com

## Version History

### 0.1.0 (May 2026)
- Initial release
- Core hashing and canonicalization
- Event log implementation
- Memory storage
- Browser and Node.js support
