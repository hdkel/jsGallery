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
		this._renderList();
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
		clearBtn.onclick = () => {
			this._selectedIds = new Array(TEAM_SIZE).fill(null);
			this._renderSlots();
			this._renderList();
		};
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

	// Creates one filter group (single-select, click active again to clear)
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
		this._renderSlots();
		this._renderList();
	}

	_deselectCharacter(id) {
		const index = this._selectedIds.indexOf(id);
		if (index !== -1) {
			this._selectedIds[index] = null;
		}
		this._renderSlots();
		this._renderList();
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
}
