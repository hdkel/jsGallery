# WuWa Teams Wiki - Team Composition Data

## Overview
This directory contains team composition data for Honkai: Star Rail character builds.

## Files
- `team-comps.json` - Pre-calculated team compositions with damage numbers
  - Each entry contains 3 characters (comp array)
  - Multiple calculation variants per team (calc array)
  - Damage values and build details for each character

## Performance Notes
The `TeamCompLookupManager` class uses O(1) lookup indexes to efficiently search through thousands of compositions:
- **Single-char index**: Maps each character → all comps containing it
- **Exact-match index**: Maps sorted char names ["a","b","c"] → matching comps
- **High-damage index**: Tracks top damage comps for quick access

This allows instant lookups even with 1000+ team compositions.

## Usage
See `wuwa-teams.js` for the lookup manager implementation and API documentation.