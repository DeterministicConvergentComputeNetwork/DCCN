# DCCN — Deterministic Convergent Compute Network
# Copyright (C) 2025  James Chapman <xhecarpenxer@gmail.com>
# GPL-3.0-or-later

"""DCCN: Deterministic Convergent Compute Network."""

__version__ = "0.1.0"
__author__ = "James Chapman"

from dccn.core.canonicalize import canonicalize, canonical_json
from dccn.core.hash import canonical_hash, sha256_str, sha256_bytes
from dccn.core.cid import make_cid, cid_to_hash_prefix, is_valid_cid
from dccn.core.event import Event, EventLog, build_event
from dccn.core.reducer import Reducer, DCCNState, default_reducer
from dccn.core.store import MemoryStore, FileStore

__all__ = [
    "canonicalize",
    "canonical_json",
    "canonical_hash",
    "sha256_str",
    "sha256_bytes",
    "make_cid",
    "cid_to_hash_prefix",
    "is_valid_cid",
    "Event",
    "EventLog",
    "build_event",
    "Reducer",
    "DCCNState",
    "default_reducer",
    "MemoryStore",
    "FileStore",
]
