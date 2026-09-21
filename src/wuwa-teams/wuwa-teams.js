import { TeamCompLookupManager } from './lookup-manager.js';
import { emptyDom } from '../utility.js';

const ASSET_BASE = 'src/assets/wuwa';
const RARITIES = [5, 4];
const ELEMENTS = ['Aero', 'Electro', 'Fusion', 'Glacio', 'Havoc', 'Spectro'];
const WEAPONS = ['Broadblade', 'Gauntlets', 'Pistols', 'Rectifier', 'Sword'];
const TEAM_SIZE = 3;

export class WuwaTeams {

	constructor(args) {
		const { target } = args;

		this._selectedRarity = null;
		this._selectedElement = null;
		this._selectedWeapon = null;
		this._characters = [];
		this._owned = new Map();
		this._selectedIds = new Array(TEAM_SIZE).fill(null);

		this._root = document.createElement('div');
		this._root.classList.add('wt-root');
		target.append(this._root);

		this._leftEl = document.createElement('div');
		this._leftEl.classList.add('wt-left');
		this._root.append(this._leftEl);

		this._renderSlotsBar();

		this._renderFilters();

		this._listEl = document.createElement('div');
		this._listEl.classList.add('wt-character-list');
		this._leftEl.append(this._listEl);

		this._rightEl = document.createElement('div');
		this._rightEl.classList.add('wt-right');
		this._root.append(this._rightEl);

		this._compResultsEl = document.createElement('div');
		this._compResultsEl.classList.add('wt-comp-results');
		this._rightEl.append(this._compResultsEl);

		this._renderSlots();

		this._loadData();
	}

	// Fetches character + owned-character data. Uses import.meta.url so the
	// path resolves correctly regardless of the pushState route currently shown.
	async _loadData() {
		const charactersUrl = new URL('./data/characters.json', import.meta.url);
		const ownedUrl = new URL('./data/owned-characters.json', import.meta.url);

		const [characters, owned] = await Promise.all([
			fetch(charactersUrl).then((r) => r.json()),
			fetch(ownedUrl).then((r) => r.json())
		]);

		this._characters = [...characters].sort((a, b) => a.name.localeCompare(b.name));
		this._owned = new Map(owned.map((o) => [o.id, o]));

		// Initialize team comp lookup manager
		const compDataUrl = new URL('./data/team-comps.json', import.meta.url);
		fetch(compDataUrl).then((r) => r.json()).then((comps) => {
			this._compLookup = new TeamCompLookupManager();
			this._compLookup.initialize(comps);
			console.log(`[WuWaTeams] Loaded ${comps.length} team compositions`);
			this._renderList();
			this._renderResults();
		});
	}

	_renderSlotsBar() {
		const bar = document.createElement('div');
		bar.classList.add('wt-slots-bar');

		this._slotsEl = document.createElement('div');
		this._slotsEl.classList.add('wt-slots');
		bar.append(this._slotsEl);

		const actions = document.createElement('div');
		actions.classList.add('wt-slots-actions');

		const saveBtn = document.createElement('button');
		saveBtn.classList.add('wt-action-btn');
		saveBtn.innerText = 'Save';
		actions.append(saveBtn);

		const clearBtn = document.createElement('button');
		clearBtn.classList.add('wt-action-btn');
		clearBtn.innerText = 'Clear';
		actions.append(clearBtn);

		bar.append(actions);
		this._leftEl.append(bar);
	}

	_renderFilters() {
		const filters = document.createElement('div');
		filters.classList.add('wt-filters');

		filters.append(this._createFilterRow(RARITIES, (value) => {
			this._selectedRarity = this._selectedRarity === value ? null : value;
		}, () => this._selectedRarity, (value) => {
			const badge = document.createElement('span');
			badge.classList.add('wt-rarity-icon', value === 5 ? 'wt-rarity-5' : 'wt-rarity-4');
			badge.innerText = `${value}★`;
			return badge;
		}));

		filters.append(this._createFilterRow(ELEMENTS, (value) => {
			this._selectedElement = this._selectedElement === value ? null : value;
		}, () => this._selectedElement, (value) => {
			const icon = document.createElement('img');
			icon.src = `${ASSET_BASE}/element_${value.toLowerCase()}.webp`;
			icon.alt = value;
			return icon;
		}));

		filters.append(this._createFilterRow(WEAPONS, (value) => {
			this._selectedWeapon = this._selectedWeapon === value ? null : value;
		}, () => this._selectedWeapon, (value) => {
			const icon = document.createElement('img');
			icon.src = `${ASSET_BASE}/weapon_${value.toLowerCase()}.webp`;
			icon.alt = value;
			return icon;
		}));

		this._leftEl.append(filters);
	}

	_createFilterRow(values, onSelect, getSelected, renderContent) {
		const row = document.createElement('div');
		row.classList.add('wt-filter-row');

		values.forEach((value) => {
			const btn = document.createElement('button');
			btn.classList.add('wt-filter-btn');
			btn.title = value;
			btn.dataset.value = value;
			btn.append(renderContent(value));

			btn.onclick = () => {
				onSelect(value);
				row.querySelectorAll('.wt-filter-btn').forEach((b) => {
					b.classList.toggle('wt-active', b.dataset.value === String(getSelected()));
				});
				this._renderList();
			};

			row.append(btn);
		});

		return row;
	}

	_renderList() {
		emptyDom(this._listEl);

		const filtered = this._characters.filter((c) =>
			(!this._selectedRarity || c.rarity === this._selectedRarity) &&
			(!this._selectedElement || c.element === this._selectedElement) &&
			(!this._selectedWeapon || c.weapon === this._selectedWeapon)
		);

		filtered.forEach((c) => this._listEl.append(this._createCard(c)));
	}

	_selectCharacter(id) {
		if (this._selectedIds.includes(id)) {
			this._deselectCharacter(id);
			return;
		}
		const emptyIndex = this._selectedIds.indexOf(null);
		if (emptyIndex === -1) {
			return;
		}
		this._selectedIds[emptyIndex] = id;

		// Log character selection for debugging
		const character = this._characters.find(c => c.id === id);
		console.log(`[WuWaTeams] Character selected: ${character?.name || 'unknown'} (id: ${id})`);

		// Query comps containing this character for troubleshooting
		if (this._compLookup) {
			const compsWithChar = this._compLookup.findCompsByCharacter(character.id);
			console.log(`[WuWaTeams] Character "${character.name}" (${character.id}) appears in ${compsWithChar.length} team compositions`);

			// Additional: Check if exact match exists for debugging
			const remainingSlots = 2 - this._selectedIds.filter(i => i !== null && i !== id).length;
			if (remainingSlots < TEAM_SIZE) {
				console.log(`[WuWaTeams] Partial selection (${this._selectedIds.filter(i => i).length}/${TEAM_SIZE}) - showing partial match preview`);
			}
		}

		this._renderSlots();
		this._renderList();

		// Render results showing comps containing ANY selected character
		this._renderResults();
	}

	_deselectCharacter(id) {
		const index = this._selectedIds.indexOf(id);
		if (index !== -1) {
			this._selectedIds[index] = null;
		}
		this._renderSlots();
		this._renderList();

		// Log results when deselecting
		const strings = JSON.stringify(this._selectedIds.map(id => {
			const char = this._characters.find(c => c.id === id);
			return char ? `${char.name} (S${id})` : null;
		}));

		console.log(`[WuWaTeams] Selection changed. Selected IDs: ${strings}`);
		this._renderResults();
	}

	_renderSlots() {
		emptyDom(this._slotsEl);

		for (let i = 0; i < TEAM_SIZE; i++) {
			const id = this._selectedIds[i];
			const slot = document.createElement('div');
			slot.classList.add('wt-slot');

			if (id) {
				const character = this._characters.find((c) => c.id === id);
				slot.classList.add('wt-slot-filled');
				slot.classList.add(character.rarity === 5 ? 'wt-rarity-5' : 'wt-rarity-4');

				const avatar = document.createElement('img');
				avatar.classList.add('wt-slot-avatar');
				avatar.src = `${ASSET_BASE}/characters/${character.id}.webp`;
				avatar.alt = character.name;
				slot.append(avatar);

				const name = document.createElement('div');
				name.classList.add('wt-slot-name');
				name.innerText = character.name;
				slot.append(name);

				slot.onclick = () => this._deselectCharacter(id);
			} else {
				slot.classList.add('wt-slot-empty');
			}

			this._slotsEl.append(slot);
		}
	}

	_createCard(character) {
		const owned = this._owned.get(character.id);

		const card = document.createElement('div');
		card.classList.add('wt-card');
		card.classList.toggle('wt-selected', this._selectedIds.includes(character.id));
		card.onclick = () => this._selectCharacter(character.id);

		const inner = document.createElement('div');
		inner.classList.add('wt-card-inner');
		inner.classList.toggle('wt-owned', !!owned);
		inner.classList.toggle('wt-unowned', !owned);
		inner.classList.add(character.rarity === 5 ? 'wt-rarity-5' : 'wt-rarity-4');
		card.append(inner);

		const avatar = document.createElement('img');
		avatar.classList.add('wt-avatar');
		avatar.src = `${ASSET_BASE}/characters/${character.id}.webp`;
		avatar.alt = character.name;
		inner.append(avatar);

		const topBadges = document.createElement('div');
		topBadges.classList.add('wt-top-badges');

		const elementIcon = document.createElement('img');
		elementIcon.classList.add('wt-icon');
		elementIcon.src = `${ASSET_BASE}/element_${character.element.toLowerCase()}.webp`;
		elementIcon.alt = character.element;
		topBadges.append(elementIcon);

		if (character.weapon) {
			const weaponIcon = document.createElement('img');
			weaponIcon.classList.add('wt-icon');
			weaponIcon.src = `${ASSET_BASE}/weapon_${character.weapon.toLowerCase()}.webp`;
			weaponIcon.alt = character.weapon;
			topBadges.append(weaponIcon);
		}
		inner.append(topBadges);

		if (owned) {
			const setup = document.createElement('div');
			setup.classList.add('wt-setup-badge');
			setup.innerText = `S${owned.rc}R${owned.sig}`;
			inner.append(setup);
		}

		const name = document.createElement('div');
		name.classList.add('wt-name');
		name.innerText = character.name;
		inner.append(name);

		return card;
	}

	/**
	 * Render team comp results as characters are selected
	 * Shows all comps containing ANY selected character (partial match)
	 * Only shows exact match when all 3 slots are filled
	 */
	_renderResults() {
		const selectedCharIds = this._selectedIds.filter(id => id !== null);

		if (selectedCharIds.length === 0) {
			// No characters selected - show info about how to use
			console.log(`[WuWaTeams] Select characters from left panel`);
			this._renderResultsPlaceholder({
				showInfo: false,
				selectedCharIds: []
			});
			return;
		}

		const selectedCharNames = selectedCharIds.map(id => this._characters.find(c => c.id === id)?.name).filter(Boolean);

		if (selectedCharIds.length < TEAM_SIZE) {
			// 1-2 characters selected - show ALL comps containing ANY of them (partial match)
			console.log(`[WuWaTeams] Partial selection: ${selectedCharNames.join(', ')}`);
			console.log(`[WuWaTeams] Showing partial matches for: ${JSON.stringify(selectedCharIds)}`);

			// Get all comps containing any selected character
			const partialMatches = this._compLookup.findAnyCharacter(selectedCharIds);
			console.log(`[WuWaTeams] Found ${partialMatches.length} comps containing any selected character`);

			if (partialMatches && partialMatches.length > 0) {
				// Log first few results for debugging
				if (partialMatches.length <= 5 || partialMatches[0]?.calc?.length === 0) {
					console.log(`[WuWaTeams] Partial match comps:`, JSON.stringify(partialMatches.slice(0, 3), null, 2));
				}
				this._renderResultsTable(partialMatches, selectedCharIds, 'partial');
			}
			else {
				// No matches found for any selected character
				console.log(`[WuWaTeams] No comps found containing: ${selectedCharNames.join(', ')}`);
				this._renderResultsPlaceholder({
					showInfo: true,
					selectedCharIds
				});
			}
			return;
		}

		// All 3 slots filled - look up exact match comps efficiently
		console.log(`[WuWaTeams] Rendering results for: ${selectedCharNames.join(', ')}`);
		console.log(`[WuWaTeams] Looking up exact match with character IDs: ${JSON.stringify(selectedCharIds)}`);
		const matchingComps = this._compLookup.findExactMatch(selectedCharIds);

		if (matchingComps && matchingComps.length > 0) {
			console.log(`[WuWaTeams] Found ${matchingComps.length} exact match${matchingComps.length > 1 ? 'es' : ''}`);
			// Log first few results for debugging
			if (matchingComps.length <= 5 || matchingComps[0]?.calc?.length === 0) {
				console.log(`[WuWaTeams] Exact match comps:`, JSON.stringify(matchingComps.slice(0, 3), null, 2));
			}
			this._renderResultsTable(matchingComps, selectedCharIds, 'exact');
		}
		else {
			// No exact match found - fall back to partial match or show placeholder
			console.log(`[WuWaTeams] No exact match found for: ${selectedCharNames.join(', ')}`);
			const partialMatches = this._compLookup.findAnyCharacter(selectedCharIds);
			if (partialMatches && partialMatches.length > 0) {
				console.log(`[WuWaTeams] Showing partial matches instead: ${partialMatches.length} comps`);
				this._renderResultsTable(partialMatches, selectedCharIds, 'partial');
			}
			else {
				this._renderResultsPlaceholder({
					showInfo: true,
					selectedCharIds
				});
			}
		}
	}

	/**
	 * Render placeholder when no exact matches found or not enough chars selected
	 */
_renderResultsPlaceholder(args) {
		const container = document.createElement('div');
		container.classList.add('wt-results-placeholder', 'wt-comp-results-info');

		if (args?.showInfo === false) {
			// Not enough characters selected - show character selection info
			const availableChars = this._characters.map(c => c.name).slice(0, 5).join(', ');
			container.innerHTML = `
				<h3>Select 3 Characters</h3>
				<p>Select all three team slots to see matching team compositions and damage calculations.</p>
				<p>Available characters: ${availableChars}...</p>
			`;
		}
		else if (args?.showInfo === true) {
			// No matching comp found for this exact combination
			const selectedCharIds = args?.selectedCharIds || [];
			const selectedCharNames = selectedCharIds.map(id => {
				const char = this._characters.find(c => c.id === id);
				return char ? char.name : `Unknown_${id}`;
			}).filter(Boolean);

			container.innerHTML = `
				<h3>No team comps found</h3>
				<p>Character combination: ${selectedCharNames.join(', ')}</p>
				<p>This exact combination isn't in our wiki database yet.</p>
				<p>We currently have <strong>${this._compLookup.getTotalCount()}</strong>+ team compositions indexed.</p>
			`;

			// Add a "Find Similar Comps" button if partial match available
			const partialMatches = this._findAnyMatchingComps(selectedCharIds);
			if (partialMatches && partialMatches.length > 0) {
				const btn = document.createElement('button');
				btn.classList.add('wt-action-btn', 'wt-similar-comps');
				btn.innerText = `Show ${partialMatches.length} Team Comp${partialMatches.length > 1 ? 's' : ''} (Contains Any)`;
				btn.onclick = () => {
					this._renderResultsTable(partialMatches, selectedCharIds, 'partial');
				};

				const tempDiv = container.firstElementChild;
				container.appendChild(tempDiv);
				container.appendChild(btn);
			}
		}

		// Clear existing content and add new placeholder
		emptyDom(this._compResultsEl);
		this._compResultsEl.append(container);
	}

	/**
	 * Find similar comps that share 2 out of 3 characters
	 */
	findSimilar(charIds, missingCharId) {
		if (charIds.length !== 2) return [];

		// Try all permutations of adding each possible character ID
		const results = [];

		// Get all character IDs for iteration
		const allCharIds = this._characters.map(c => c.id);
		const uniqueCharIds = [...new Set(allCharIds)];

		for (const candidateCharId of uniqueCharIds) {
			if (!charIds.includes(candidateCharId)) {
				// Try this character ID + the 2 selected ones
				const newCombo = [...charIds, candidateCharId].sort();
				const key = newCombo.join(',');

				if (this._compLookup._exactMatchIndex.has(key)) {
					const compEntries = this._compLookup._exactMatchIndex.get(key);
					// Filter out comps that include the missing character ID
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
	 * Get all comps containing ANY selected character (for "Contains Any" view)
	 */
	_findAnyMatchingComps(charIds) {
		console.log(`[WuWaTeams] Finding partial match for: ${charIds.join(', ')}`);
		const results = this._compLookup.findAnyCharacter(charIds);
		console.log(`[WuWaTeams] Found ${results.length} comps containing any selected character`);

		if (results.length > 0) {
			// Log first few results for debugging
			if (results.length <= 5 || results[0]?.calc?.length === 0) {
				console.log(`[WuWaTeams] Partial match comps:`, JSON.stringify(results.slice(0, 3), null, 2));
			}
		}

		return results;
	}

	/**
	 * Render results table for team comps - supports exact match and partial match modes
	 */
	_renderResultsTable(comps, charIds, mode = 'exact') {
		// Clear existing results
		emptyDom(this._compResultsEl);

		const displayMode = mode === 'partial' ? '(Contains Any)' : '';
		console.log(`[WuWaTeams] Rendering ${comps.length} comp${comps.length > 1 ? 's' : ''}${displayMode}`);

		// For partial match, we need to show which characters from the selection are in each comp
		const selectedCharNames = charIds.map(id => this._characters.find(c => c.id === id)?.name).filter(Boolean);

		// Create table header
		const table = document.createElement('table');
		table.classList.add('wt-results-table');

		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');

		// Character name columns (display names for UI)
		const charNames = charIds.map(id => {
			const char = this._characters.find(c => c.id === id);
			return char ? char.name : `Unknown_${id}`;
		});

		charNames.forEach((name, index) => {
			const th = document.createElement('th');
			// For partial match, show which characters from selection are in this comp
			if (mode === 'partial') {
				// Show character names with checkmarks for present chars
				th.innerText = `${name}${selectedCharNames.includes(name) ? '\u2713' : ''}`;
			} else {
				th.innerText = `Slot ${index + 1}: ${name}`;
			}
			headerRow.append(th);
		});

		// Damage and build column
		const damageTh = document.createElement('th');
		damageTh.colSpan = charNames.length + 1;
		damageTh.innerText = 'Damage';
		headerRow.append(damageTh);

		thead.append(headerRow);
		table.append(thead);

		// Table body - iterate through matching comps
		const tbody = document.createElement('tbody');

		for (const comp of comps) {
			const row = document.createElement('tr');
			row.classList.add('wt-result-row');

			// Get max damage from this comp's calc array
			let maxDamage = 0;

			for (const calc of comp.calc) {
				if (calc.damage > maxDamage) {
					maxDamage = calc.damage;
				}
			}

			// Build description string for exact match mode only
			let buildString = [];

			for (const calc of comp.calc) {
				if (mode !== 'partial') {
					// Build description string
					const buildDesc = Object.entries(calc.build || {})
					.map(([charId, stats]) => {
						let desc = `${this._characters.find(c => c.id === charId)?.name?.toUpperCase() || charId.toUpperCase()}`;
						if (stats.rc !== undefined && stats.rc >= 0) {
							desc += ` R${stats.rc}`;
						}
						if (stats.sig !== undefined && stats.sig === 1) {
							desc += 'S';
						}
						if (stats.weapon || stats.echo) {
							desc += ` (${stats.weapon || stats.echo})`;
						}
						return desc;
					})
					.join(' + ');

				buildString.push(buildDesc);
			}

			// For partial match mode, rebuild description with only selected characters
			let primaryBuild;
			if (mode === 'partial') {
				const charNames = selectedCharNames.map(n => this._characters.find(c => c.name === n)?.id);

				// Rebuild the description with only selected characters
				const filteredBuildDesc = Object.entries(comp.calc[0]?.build || {})
					.filter(([charId]) => charNames?.includes(charId))
					.map(([charId, stats]) => {
						let desc = `${this._characters.find(c => c.id === charId)?.name?.toUpperCase() || charId.toUpperCase()}`;
						if (stats.rc !== undefined && stats.rc >= 0) {
							desc += ` R${stats.rc}`;
						}
						if (stats.sig !== undefined && stats.sig === 1) {
							desc += 'S';
						}
						if (stats.weapon || stats.echo) {
							desc += ` (${stats.weapon || stats.echo})`;
						}
						return desc;
					})
					.join(' + ');

				// Display the filtered build
				primaryBuild = filteredBuildDesc || '-';
			} else {
				// Display first/primary build or combine multiple builds
				primaryBuild = buildString.join(', ');
			}

			row.innerHTML = `
				<td class="wt-damage">${maxDamage.toLocaleString()}</td>
				<td colspan="charIds.length + 1" class="wt-build-desc">
					${primaryBuild}
				</td>
			`;

			tbody.append(row);
		}

			table.append(tbody);
			this._compResultsEl.append(table);
		}
	}
}