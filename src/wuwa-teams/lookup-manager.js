/**
 * TeamCompLookupManager - Efficient team composition lookup system
 */
class TeamCompLookupManager {
    constructor() {
        this._originalData = [];
        this._lookupMap = new Map();
    }

    /**
     * Initialize with raw data - called once during load
     * @param {Array} rawData - Array of comp entries with 'comp', 'calc' fields
     */
    initialize(rawData) {
        const start = performance.now();
        this._originalData = [...rawData];
        this._originalData.forEach((teamComp, i) => {
            for (const char of teamComp.comp) {
                if (!this._lookupMap.has(char)) {
                    this._lookupMap.set(char, new Set());
                }
                this._lookupMap.get(char).add(i);
            }
        });
        const elapsed = (performance.now() - start).toFixed(4);
        console.log(`TeamCompLookupManager initialized with ${rawData.length} comps in ${elapsed}`);
    }

    filterBySelectedCharacterIds(selectedCharIds) {

        if (selectedCharIds.length === 0) return [];

        const relevantSetIds = selectedCharIds
            .map(charId => this._lookupMap.get(charId) || new Set())
            .sort((a, b) => a.size - b.size);

        let result = relevantSetIds[0];
        for (let i = 1; i < relevantSetIds.length; i++) {
            result = result.intersection(relevantSetIds[i]);
            if (result.size === 0) break;
        }

        return [...result].map(i => this._originalData[i]);
    }
}

export {TeamCompLookupManager};