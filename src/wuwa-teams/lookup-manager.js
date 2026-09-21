/**
 * Team Comp Lookup Manager - Efficient O(1) lookups for large datasets
 * Uses multiple indexes to avoid O(n) iteration through thousands of comps
 */

const TEAM_SIZE = 3;

/**
 * TeamCompLookupManager - Efficient team composition lookup system
 * 
 * Performance Characteristics:
 * - Initialization: O(N × M) where N = #comps, M = TEAM_SIZE (3)
 * - Exact match lookup: O(1) via sorted key index
 * - Character search: O(K × N') where K = #unique chars, N' = small subset
 */
class TeamCompLookupManager {
  constructor() {
    // Original array (for preserving order when needed)
    this._originalData = [];

    // Single-character index: Maps char ID -> Set of comp IDs that include it
    this._charToComps = new Map();

    // Multi-char intersection index: For exact matches, use direct lookup
    this._exactMatchIndex = new Map(); // key: "a,b,c" (sorted) -> comp entries[]

    // Damage-focused index: For high-damage comps by character combinations
    this._highDamageIndex = new Map(); // key: sorted char IDs -> high damage comps
  }

  /**
   * Initialize with raw data - called once during load
   * @param {Array} rawData - Array of comp entries with 'comp', 'calc' fields
   */
  initialize(rawData) {
    this._originalData = [...rawData];

    // Build all indexes in O(n*m) where n=comps, m=TEAM_SIZE (3)
    // This is done once during load, then lookups are O(1)
    
    for (let i = 0; i < rawData.length; i++) {
      const compEntry = rawData[i];
      const sortedChars = [...compEntry.comp].sort();
      
      // Single-character index: each character ID -> all comps containing it
      for (const charId of compEntry.comp) {
        if (!this._charToComps.has(charId)) {
          this._charToComps.set(charId, new Set());
        }
        this._charToComps.get(charId).add(i);
      }

      // Exact match index: sorted key -> all matching comps
      const key = sortedChars.join(',');
      if (!this._exactMatchIndex.has(key)) {
        this._exactMatchIndex.set(key, []);
      }
      this._exactMatchIndex.get(key).push(compEntry);

      // High damage index: track top damage for each character combo
      const maxDamage = Math.max(...compEntry.calc?.map(c => c.damage) || [0]);
      if (maxDamage >= 1000000) { // Only index high-damage comps
        this._highDamageIndex.set(key, compEntry);
      }
    }

    console.log(`TeamCompLookupManager initialized with ${rawData.length} comps`);
  }

  /**
   * Find all team comps that include ALL selected characters (and only those)
   * Uses exact match index for O(1) lookup when possible, fallback to intersection
   * @param {string[]} charIds - Array of character IDs (exact match)
   * @returns {Array} All matching comp entries
   */
  findExactMatch(charIds) {
    if (charIds.length !== TEAM_SIZE) return [];

    const sorted = [...charIds].sort();
    const key = sorted.join(',');
    
    // Fast path: exact multi-char index
    if (this._exactMatchIndex.has(key)) {
      return this._exactMatchIndex.get(key);
    }

    // Fallback: intersect the Sets for each character
    const compIds = this._charToComps.get(charIds[0]);
    if (!compIds) return [];

    let results = [];
    for (const id of compIds) {
      if (this._isExactMatch(this._originalData[id], charIds)) {
        results.push(this._originalData[id]);
      }
    }

    return results;
  }

  /**
   * Check if a comp contains EXACTLY the given characters (same set, same length)
   * This ensures we don't match comps that have extra characters or are missing some
   */
  _isExactMatch(compEntry, charIds) {
    // Must have same number of characters
    if (compEntry.comp.length !== charIds.length) return false;
    
    const set = new Set(charIds);
    for (const charId of compEntry.comp) {
      if (!set.has(charId)) return false;
    }
    return true;
  }

  /**
   * Find all team comps that include a character (with optional filters)
   * Useful for "what other comps use this character?" queries
   * @param {string} charId - Character ID to find comps for
   * @returns {Array} All comps containing this character
   */
  findCompsByCharacter(charId) {
    const compIds = this._charToComps.get(charId);
    if (!compIds) return [];

    // Preserve original order
    const results = [];
    for (const id of compIds) {
      results.push(this._originalData[id]);
    }
    return results;
  }

  /**
   * Get top N highest-damage comps for a character combination
   * Uses high damage index for fast access
   * @param {string[]} charIds - Character IDs (exact match)
   * @param {number} limit - Max results to return
   * @returns {Array} High damage comp entries
   */
  getTopDamageComps(charIds, limit = 5) {
    const sorted = [...charIds].sort();
    const key = sorted.join(',');
    
    // Fast path: direct high damage index
    if (this._highDamageIndex.has(key)) {
      return [this._highDamageIndex.get(key)];
    }

    // Fallback: get exact matches and filter by damage
    const allComps = this.findExactMatch(charIds);
    if (!allComps) return [];

    return allComps
      .filter(c => c.calc && c.calc.length > 0)
      .sort((a, b) => {
        const maxA = Math.max(...a.calc.map(c => c.damage));
        const maxB = Math.max(...b.calc.map(c => c.damage));
        return maxB - maxA;
      })
      .slice(0, limit);
  }

  /**
   * Get best (highest damage) comp for exact character match
   */
  getBestComp(charIds) {
    const comps = this.findExactMatch(charIds);
    if (!comps || comps.length === 0) return null;

    return comps.reduce((best, current) => {
      const bestMax = Math.max(...best.calc.map(c => c.damage));
      const currentMax = Math.max(...current.calc.map(c => c.damage));
      return currentMax > bestMax ? current : best;
    });
  }

  /**
   * Get all comps containing a character (for "other teams" view)
   */
  getCompsWithCharacter(charId, limit = 20) {
    const results = this.findCompsByCharacter(charId);
    return results.slice(0, limit);
  }

  /**
   * Get total number of comps in database (for pagination/info display)
   */
  getTotalCount() {
    return this._originalData.length;
  }

  /**
   * Get highest damage across all comps (for UI info)
   */
  getMaxDamage() {
    if (this._originalData.length === 0) return 0;
    const damages = [];
    for (const comp of this._originalData) {
      for (const calc of comp.calc) {
        damages.push(calc.damage);
      }
    }
    return Math.max(...damages, 0);
  }

  /**
   * Find similar comps that share 2 out of 3 characters
   */
  findSimilar(charIds, missingCharId) {
    if (charIds.length !== 2) return [];
    
    // Try all permutations of adding each possible character
    const results = [];
    
    // Get all characters for iteration
    const allChars = this._originalData.flatMap(c => c.comp);
    const uniqueChars = [...new Set(allChars)];
    
    for (const candidateCharId of uniqueChars) {
      if (!charIds.includes(candidateCharId)) {
        // Try this character + the 2 selected ones
        const newCombo = [...charIds, candidateCharId].sort();
        const key = newCombo.join(',');
        
        if (this._exactMatchIndex.has(key)) {
          const compEntries = this._exactMatchIndex.get(key);
          // Filter out comps that include the missing character
          const filtered = compEntries.filter(c => {
            return !c.comp.includes(missingCharId);
          });
          results.push(...filtered);
        }
      }
    }
    
    return results.slice(0, 10); // Return top 10 similar comps
  }

	/**
	 * Get all comps containing ANY of the selected character IDs (partial match)
	 * Uses union of character indexes for efficient O(1) per-character lookup
	 * @param {string[]} charIds - Array of character IDs (partial match, any is OK)
	 * @returns {Array} All matching comp entries
	 * @deprecated Use findExactMatchForXChars instead
	 */
  findAnyCharacter(charIds) {
    if (charIds.length === 0) return [];
    
    // Get all comps from each selected character's Set
    const allCompIds = new Set();
    for (const charId of charIds) {
      const compIds = this._charToComps.get(charId);
      if (compIds) {
        for (const id of compIds) {
          allCompIds.add(id);
        }
      }
    }
    
    // Preserve original order
    const results = [];
    for (let i = 0; i < this._originalData.length; i++) {
      if (allCompIds.has(i)) {
        results.push(this._originalData[i]);
      }
    }
    
    // Sort by max damage descending
    return results.sort((a, b) => {
      const maxA = Math.max(...a.calc.map(c => c.damage));
      const maxB = Math.max(...b.calc.map(c => c.damage));
      return maxB - maxA;
    });
  }

  /**
	 * Find exact match comps for any number of selected characters (1, 2, or 3)
	 * Returns all comps that contain ALL of the selected characters
	 * @param {string[]} charIds - Array of character IDs (exact match required)
	 * @returns {Array} All matching comp entries
	 */
  findExactMatchForXChars(charIds) {
    if (charIds.length === 0) return [];
    
    const sorted = [...charIds].sort();
    const key = sorted.join(',');
    
    // Fast path: exact multi-char index
    if (this._exactMatchIndex.has(key)) {
      return this._exactMatchIndex.get(key);
    }
    
    // Fallback: intersect the Sets for each character
    const compIndices = this._charToComps.get(charIds[0]);
    if (!compIndices) return [];
    
    let results = [];
    for (const id of compIndices) {
      if (this._isExactMatch(this._originalData[id], charIds)) {
        results.push(this._originalData[id]);
      }
    }
    
    return results;
  }

/**
   * Get the raw data array (for advanced use cases)
   */
  getData() {
    return [...this._originalData];
  }
}

export { TeamCompLookupManager };