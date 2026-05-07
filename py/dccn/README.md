# DCCN Python Package

Python implementation of the Deterministic Convergent Compute Network.

## Installation

### From PyPI (coming soon)

```bash
pip install dccn
```

### From Source

```bash
git clone https://github.com/yourusername/DCCN.git
cd DCCN/py
pip install -e .
```

### Development Installation

```bash
cd py
pip install -e ".[dev]"
```

## Quick Start

### Basic Usage

```python
from dccn import canonical_hash, make_cid

# Canonical hashing (order-independent)
hash1 = canonical_hash({'b': 2, 'a': 1})
hash2 = canonical_hash({'a': 1, 'b': 2})
assert hash1 == hash2  # ✓ True

# Create content identifier
cid = make_cid(hash1)
print(f"CID: {cid}")
```

### Event Log

```python
from dccn import EventLog, MemoryStore

# Create event log with in-memory storage
log = EventLog(MemoryStore())

# Add events
event1 = log.add_event('start', {'name': 'process'})
event2 = log.add_event('complete', {'status': 'success'})

# Get current state
state = log.get_state()
print(f"Events: {state['eventCount']}")
print(f"State Root: {state['stateRoot']}")
```

### Reducers for State Management

```python
from dccn import Reducer, Event

def counter_reducer(state, event):
    """Pure function to update counter state."""
    if event['type'] == 'increment':
        return {'count': state.get('count', 0) + event['amount']}
    elif event['type'] == 'decrement':
        return {'count': state.get('count', 0) - event['amount']}
    elif event['type'] == 'reset':
        return {'count': 0}
    return state

# Initialize reducer
reducer = Reducer(counter_reducer)

# Apply events
initial = {'count': 0}
state1 = reducer.apply_event(initial, Event('increment', {'amount': 5}))
state2 = reducer.apply_event(state1, Event('increment', {'amount': 3}))
assert state2['count'] == 8  # ✓ True
```

### Persistent Storage

```python
from dccn import EventLog, FileStore

# Use file-based storage
store = FileStore('./my-dccn-data')
log = EventLog(store)

# Persist events to disk
log.add_event('transaction', {'id': '001', 'amount': 100})

# Reload from disk (new process)
log2 = EventLog(FileStore('./my-dccn-data'))
state = log2.get_state()
```

## API Reference

### Core Hashing

#### `canonical_hash(data) -> str`
Generate deterministic SHA256 hash of any Python object.

**Parameters:**
- `data` (Any) - Object to hash (dict, list, str, int, etc.)

**Returns:**
- `str` - 64-character hexadecimal hash

**Example:**
```python
from dccn import canonical_hash

h = canonical_hash({'key': 'value'})
# h = 'e2d0...'
```

#### `canonical_json(data) -> str`
Get canonical JSON representation (sorted keys, no extra whitespace).

**Parameters:**
- `data` (Any) - Object to serialize

**Returns:**
- `str` - Canonical JSON string

#### `sha256_str(s: str) -> str`
Hash a string directly.

**Parameters:**
- `s` (str) - String to hash

**Returns:**
- `str` - 64-character hexadecimal hash

#### `sha256_bytes(b: bytes) -> str`
Hash bytes directly.

**Parameters:**
- `b` (bytes) - Bytes to hash

**Returns:**
- `str` - 64-character hexadecimal hash

### Content Addressing

#### `make_cid(hash_value: str, metadata: dict = None) -> str`
Create a content identifier from a hash.

**Parameters:**
- `hash_value` (str) - Hash to create CID from
- `metadata` (dict, optional) - Metadata to include

**Returns:**
- `str` - Content identifier (e.g., 'a1b2c3d4-...')

**Example:**
```python
from dccn import make_cid

hash_val = 'abc123def456...'
cid = make_cid(hash_val)
```

#### `cid_to_hash_prefix(cid: str) -> str`
Extract hash from a content identifier.

**Parameters:**
- `cid` (str) - Content identifier

**Returns:**
- `str` - Hash prefix

#### `is_valid_cid(cid: str) -> bool`
Validate CID format.

**Parameters:**
- `cid` (str) - String to validate

**Returns:**
- `bool` - True if valid CID format

### Event Management

#### `Event` Class

Represents a state change event.

**Constructor:**
```python
Event(type: str, payload: dict, timestamp: float = None, parent_hash: str = None)
```

**Properties:**
- `type` (str) - Event type/action name
- `payload` (dict) - Event data
- `timestamp` (float) - Unix timestamp
- `parent_hash` (str) - Hash of previous state

**Methods:**
- `to_dict()` - Convert to dictionary
- `hash()` - Get event hash

#### `EventLog` Class

Immutable append-only event log.

**Constructor:**
```python
EventLog(store: Store)
```

**Methods:**
- `add_event(type: str, payload: dict) -> Event` - Add event to log
- `get_state() -> dict` - Get current state
- `get_event(hash: str) -> Event` - Get event by hash
- `get_events(start: int = 0, end: int = None) -> list` - Get events in range
- `verify() -> bool` - Verify log integrity

**Example:**
```python
from dccn import EventLog, MemoryStore

log = EventLog(MemoryStore())
event = log.add_event('test', {'data': 'value'})
state = log.get_state()
```

### Reducers

#### `Reducer` Class

Applies events to state using a pure function.

**Constructor:**
```python
Reducer(func: Callable[[dict, Event], dict])
```

**Methods:**
- `apply_event(state: dict, event: Event) -> dict` - Apply single event
- `apply_events(state: dict, events: list) -> dict` - Apply multiple events

**Example:**
```python
from dccn import Reducer, Event

def my_reducer(state, event):
    if event['type'] == 'set':
        return {**state, **event['payload']}
    return state

reducer = Reducer(my_reducer)
new_state = reducer.apply_event({}, Event('set', {'x': 1}))
```

#### `default_reducer` Function

Built-in identity reducer (returns state unchanged).

```python
from dccn import default_reducer
```

### Storage

#### `MemoryStore` Class

In-memory storage for events (suitable for testing).

```python
from dccn import MemoryStore

store = MemoryStore()
```

**Methods:**
- `add(key: str, value: dict)` - Add item
- `get(key: str)` - Retrieve item
- `all() -> list` - Get all items
- `clear()` - Clear storage

#### `FileStore` Class

Persistent file-based storage.

```python
from dccn import FileStore

store = FileStore('./data')  # Creates directory if needed
```

**Methods:**
- `add(key: str, value: dict)` - Write to file
- `get(key: str)` - Read from file
- `all() -> list` - List all files
- `delete(key: str)` - Remove file

## Command-Line Interface

```bash
dccn --help                    # Show help
dccn init [path]              # Initialize DCCN repo
dccn log [path]               # Show event log
dccn add [path] <type> [data] # Add event
dccn state [path]             # Show current state
dccn hash [path]              # Show state hash
dccn verify [path]            # Verify integrity
```

## Testing

Run the test suite:

```bash
pytest                         # Run all tests
pytest -v                      # Verbose output
pytest --cov=dccn             # With coverage report
pytest -k test_hash           # Run specific tests
```

## Type Hints

The package includes type hints for better IDE support and type checking:

```bash
mypy .                         # Check types
```

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Run `pytest` and ensure all tests pass
5. Run `black` for code formatting
6. Submit a pull request

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

## Architecture

The Python implementation follows this structure:

```
dccn/
├── __init__.py        # Package exports
├── core/              # Core algorithms
│   ├── canonicalize.py
│   ├── hash.py
│   ├── cid.py
│   ├── event.py
│   ├── reducer.py
│   └── store.py
├── cli/               # Command-line interface
│   └── __init__.py
└── net/               # Network components
    └── __init__.py
```

## Performance

Benchmarks on typical operations:

- Hashing 1MB object: ~10ms
- Creating 1000 events: ~50ms
- Verifying log of 10000 events: ~100ms

See `benchmarks/` for detailed performance tests.

## License

GPL-3.0-or-later. See [LICENSE](../../LICENSE) for details.

## Support

- **Issues**: https://github.com/yourusername/DCCN/issues
- **Discussions**: https://github.com/yourusername/DCCN/discussions
- **Email**: xhecarpenxer@gmail.com

## Version History

### 0.1.0 (May 2025)
- Initial release
- Core hashing and canonicalization
- Event log implementation
- Memory and file storage
- Basic CLI
