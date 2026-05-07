# DCCN — Deterministic Convergent Compute Network

A deterministic, content-addressable compute system for building reproducible, verifiable distributed applications.

## Overview

DCCN is a computational framework that enables deterministic computation with cryptographic verification. It provides tools for building state machines that converge to identical results across independent runs, making it ideal for distributed systems, audit trails, and reproducible research.

### Key Features

- **Deterministic Computation**: Identical inputs always produce identical outputs
- **Content Addressing**: Cryptographic hashing for immutable references
- **Event Sourcing**: Complete audit trail of all state changes
- **Cross-Language Support**: Python and JavaScript implementations
- **Canonical Serialization**: Language-agnostic data representation
- **Type-Safe State Management**: Reducer-based state updates
- **CLI & Web Interface**: Command-line tool and interactive terminal UI

## Quick Start

### Python

```bash
pip install dccn
```

```python
from dccn import Event, EventLog, Reducer, MemoryStore
from dccn import canonical_hash, make_cid

# Create an event log
log = EventLog(MemoryStore())

# Define events
event = log.add_event('increment', {'amount': 1})

# Hash content deterministically
hash_value = canonical_hash({'counter': 1})
print(f"Hash: {hash_value}")
```

### JavaScript

```bash
npm install dccn
```

```javascript
import { Event, EventLog, MemoryStore, canonicalHash, makeCID } from 'dccn';

// Create an event log
const log = new EventLog(new MemoryStore());

// Add events and compute state
const state = log.getState();
const hash = canonicalHash({ counter: 1 });
```

### Web Interface

Open `index.html` in a browser for an interactive DCCN CLI terminal.

## Project Structure

```
DCCN/
├── README.md                 # This file
├── LICENSE                   # GPL-3.0 license
├── index.html               # Web terminal interface
├── py/                      # Python package
│   ├── setup.py            # Python package configuration
│   ├── requirements.txt     # Python dependencies
│   └── dccn/               # Main package
│       ├── __init__.py      # Package exports
│       ├── core/           # Core algorithms
│       ├── cli/            # Command-line interface
│       └── net/            # Network components
├── js/                     # JavaScript modules
│   ├── package.json        # NPM package configuration
│   ├── index.js           # Main entry point
│   ├── core/              # Core algorithms
│   └── utils/             # Utility functions
└── jsDCCN/                # TypeScript definitions
    └── index.js
```

## Core Concepts

### Events

Events represent state transitions. Each event is immutable and includes:
- Type/action name
- Payload (data)
- Timestamp
- Parent hash (linking to previous state)

### State Root

A cryptographic hash representing the complete state after applying all events.

### Content ID (CID)

A compact identifier combining the hash prefix with metadata, enabling efficient content addressing.

### Reducer

A pure function that applies events to state, producing deterministic output regardless of execution environment.

## Usage Examples

### Python

#### Basic State Management

```python
from dccn import Event, Reducer, MemoryStore

# Define a reducer (pure function for state updates)
def counter_reducer(state, event):
    if event['type'] == 'increment':
        return {**state, 'count': state.get('count', 0) + event['amount']}
    return state

# Create store and apply events
store = MemoryStore()
reducer = Reducer(counter_reducer)

initial_state = {'count': 0}
event = Event('increment', {'amount': 5})

new_state = reducer.apply_event(initial_state, event)
# new_state = {'count': 5}
```

#### Hashing & Content Addressing

```python
from dccn import canonical_hash, make_cid, canonical_json

# Canonical hashing (order-independent)
hash1 = canonical_hash({'b': 2, 'a': 1})
hash2 = canonical_hash({'a': 1, 'b': 2})
assert hash1 == hash2  # Order doesn't matter

# Create content identifiers
cid = make_cid(hash1)
print(f"CID: {cid}")  # Format: hash_prefix-metadata
```

#### Event Log with Persistence

```python
from dccn import EventLog, FileStore

# Use file-based storage for persistence
store = FileStore('./dccn-data')
log = EventLog(store)

# Add events
event = log.add_event('transfer', {'from': 'alice', 'to': 'bob', 'amount': 100})

# Get current state
state = log.get_state()
print(f"State root: {state['stateRoot']}")
```

### JavaScript

#### Basic Usage

```javascript
import { Event, canonicalHash, makeCID } from 'dccn';

// Canonical hashing
const hash1 = canonicalHash({ b: 2, a: 1 });
const hash2 = canonicalHash({ a: 1, b: 2 });
console.assert(hash1 === hash2); // Order doesn't matter

// Create content ID
const cid = makeCID(hash1);
console.log(`CID: ${cid}`);
```

#### Building Reducers

```javascript
// Define reducer
function todoReducer(state, event) {
  const newState = { ...state, todos: state.todos || [] };
  
  if (event.type === 'add-todo') {
    newState.todos.push({ id: event.id, text: event.text });
  } else if (event.type === 'toggle-todo') {
    const todo = newState.todos.find(t => t.id === event.id);
    if (todo) todo.done = !todo.done;
  }
  
  return newState;
}
```

## API Documentation

### Python Package

#### `dccn.core.hash`
- `canonical_hash(data: Any) -> str` - Generate SHA256 hash with canonical ordering
- `sha256_str(s: str) -> str` - Hash string directly
- `sha256_bytes(b: bytes) -> str` - Hash bytes directly

#### `dccn.core.canonicalize`
- `canonicalize(obj: Any) -> bytes` - Canonicalize object to bytes
- `canonical_json(obj: Any) -> str` - Get canonical JSON representation

#### `dccn.core.cid`
- `make_cid(hash_value: str) -> str` - Create content ID
- `cid_to_hash_prefix(cid: str) -> str` - Extract hash from CID
- `is_valid_cid(cid: str) -> bool` - Validate CID format

#### `dccn.core.event`
- `Event` - Event data structure
- `EventLog` - Immutable event log
- `build_event(type, payload, metadata) -> dict` - Construct event

#### `dccn.core.reducer`
- `Reducer` - Pure function reducer for state updates
- `DCCNState` - State type definition
- `default_reducer` - Basic identity reducer

#### `dccn.core.store`
- `MemoryStore` - In-memory event storage
- `FileStore` - Persistent file-based storage

### JavaScript Module

All exports available from main `dccn` module:
- `canonicalHash()` - Deterministic SHA256 hash
- `canonicalJson()` - Canonical JSON representation
- `makeCID()` - Create content identifier
- `Event` - Event class
- `EventLog` - Event log class
- `Reducer` - Reducer function class
- `MemoryStore` - In-memory storage
- ... and more

## Installation & Development

### Python Development

```bash
cd py
pip install -e ".[dev]"
pytest
```

### JavaScript Development

```bash
cd js
npm install
npm test
npm run build
```

### Building Documentation

```bash
# Python
cd py
sphinx-build -b html docs docs/_build

# JavaScript
cd js
npm run docs
```

## CLI Usage

The DCCN command-line interface provides interactive terminal operations:

```bash
dccn init              # Initialize new DCCN repository
dccn log               # Display event log
dccn add <event>       # Add event to log
dccn state             # Show current state
dccn hash              # Display state hash
dccn verify            # Verify log integrity
```

### Web Terminal

Open `index.html` in your browser for an interactive CLI with full terminal experience.

## Architecture

DCCN uses an **event sourcing** architecture:

1. **Events** - Immutable records of state changes
2. **Event Log** - Ordered sequence of events
3. **Reducer** - Pure function computing state from events
4. **State Root** - Cryptographic hash of complete state

This design ensures:
- **Reproducibility** - Same events → same state
- **Auditability** - Complete history of changes
- **Distributability** - Independent verification
- **Determinism** - No randomness or timing dependencies

## Testing

### Python

```bash
cd py
pytest tests/
pytest --cov=dccn tests/  # With coverage
```

### JavaScript

```bash
cd js
npm test
npm run test:coverage
```

## Performance

DCCN is optimized for:
- **Fast hashing** - Efficient SHA256 computation
- **Minimal serialization** - Canonical form avoids redundancy
- **Streaming events** - Process large logs incrementally
- **Lazy evaluation** - Compute state on-demand

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Setting up development environment
- Writing tests
- Submitting pull requests
- Code style standards

## License

DCCN is released under the **GPL-3.0-or-later** license. See [LICENSE](LICENSE) for details.

This ensures the project remains open-source and improvements benefit the community.

## Citation

If you use DCCN in academic work, please cite:

```bibtex
@software{dccn2026,
  title={DCCN: Deterministic Convergent Compute Network},
  author={Chapman, James and xhecarpenxer},
  year={2026},
  url={https://github.com/DeterministicConvergentComputeNetwork/DCCN}
}
```

## Support

- **Issues** - Report bugs on GitHub Issues
- **Discussions** - Ask questions on GitHub Discussions
- **Documentation** - See docs/ directory for detailed guides
- **Examples** - Check examples/ for sample projects

## Roadmap

- [ ] Python type hints (mypy compatible)
- [ ] JavaScript TypeScript definitions
- [ ] Network protocol for distributed systems
- [ ] Persistent storage backends
- [ ] Web UI dashboard
- [ ] Performance benchmarks
- [ ] Additional CLI commands

## Authors

**James Chapman** & **xhecarpenxer** - Co-creators and maintainers
- Email: xhecarpenxer@gmail.com
- Repository: https://github.com/DeterministicConvergentComputeNetwork/DCCN

## Acknowledgments

DCCN is inspired by:
- Event sourcing patterns
- Content-addressed systems (IPFS, Git)
- Functional reactive programming
- Distributed consensus algorithms

---

**Last Updated**: May 2026
**Version**: 0.1.0
**Status**: Active Development
