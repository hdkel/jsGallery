const RuneWords = [
    {
        "name": 'Mist',
        "ingredients": ['cham', 'shael', 'gul', 'thul', 'ith'],
    },
    {
        "name": 'Pride',
        "ingredients": ['cham', 'sur', 'io', 'lo'],
    },
    {
        "name": 'Pattern',
        "ingredients": ['tal', 'ort', 'thul'],
    },
    {
        "name": 'Obedience',
        "ingredients": ['hel', 'ko', 'thul', 'eth', 'fal'],
    },
    {
        "name": 'Peace',
        "ingredients": ['shael', 'thul', 'amn'],
    },
    {
        "name": 'Unbending Will',
        "ingredients": ['fal',  'io',  'ith',  'eld',  'el',  'hel'],
    },
    {
        "name": 'Treachery',
        "ingredients": ['shael',  'thul',  'lem'],
    },
    {
        "name": 'Infinity',
        "ingredients": ['ber',  'mal',  'ber', 'ist'],
    },
    {
        "name": 'Fortitude',
        "ingredients": ['el',  'sol',  'dol', 'lo'],
    },
    {
        "name": 'Leaf',
        "ingredients": ['tir',  'ral'],
    },
    {
        "name": 'Beast',
        "ingredients": ['ber',  'tir', 'um', 'mal', 'lum'],
    },
    {
        "name": 'Edge',
        "ingredients": ['tir',  'tal', 'amn'],
    },
    {
        "name": 'Famine',
        "ingredients": ['fal',  'ohm', 'ort', 'jah'],
    },
    {
        "name": 'Flickering Flame',
        "ingredients": ['nef',  'pul', 'vex'],
    },
    {
        "name": 'Phoenix',
        "ingredients": ['vex',  'vex', 'lo', 'jah'],
    },
    {
        "name": 'Wrath',
        "ingredients": ['pul',  'lum', 'ber', 'mal'],
    },
    {
        "name": 'Silence',
        "ingredients": [ 'dol,',  'eld',  'hel',  'ist',  'tir',  'vex'],
    },
    {
        "name": 'Enigma',
        "ingredients": [ 'jah,',  'ith',  'ber'],
    },
    {
        "name": 'Wisdom',
        "ingredients": [ 'pul,',  'ith',  'eld'],
    },
    {
        "name": 'Insight',
        "ingredients": [ 'ral,',  'tir',  'tal', 'sol'],
    },
    {
        "name": 'Breath of the Dying',
        "ingredients": [ 'vex,',  'hel',  'el', 'eld', 'zod', 'eth'],
    },
    {
        "name": 'Obsession',
        "ingredients": [ 'zod,',  'ist',  'lem', 'lum', 'io', 'nef'],
    },
    {
        "name": 'Melody',
        "ingredients": [ 'shael',  'ko',  'nef'],
    },
    {
        "name": 'Oath',
        "ingredients": [ 'shael',  'pul',  'mal', 'lum'],
    },
    {
        "name": 'Harmony',
        "ingredients": [ 'tir',  'ith',  'sol', 'ko'],
    },
    {
        "name": 'Delirium',
        "ingredients": [ 'lem',  'ist',  'io'],
    },
    {
        "name": 'Duress',
        "ingredients": [ 'shael',  'um', 'thul'],
    },
    {
        "name": 'Last Wish',
        "ingredients": [ 'jah', 'mal', 'jah', 'sur', 'jah', 'ber'],
    },
    {
        "name": 'White',
        "ingredients": [ 'dol', 'id'],
    },
    {
        "name": 'Rift',
        "ingredients": [ 'hel', 'ko', 'lem', 'gul'],
    },
    {
        "name": 'Black',
        "ingredients": [ 'thul', 'io', 'nef' ],
    },
    {
        "name": 'Plague',
        "ingredients": [ 'cham', 'shael', 'um' ],
    },
    {
        "name": 'Lore',
        "ingredients": [ 'ort', 'sol' ],
    },
    {
        "name": 'Brand',
        "ingredients": [ 'jah', 'lo', 'mal', 'gul' ],
    },
    {
        "name": 'Splendor',
        "ingredients": [ 'eth', 'lum'],
    },
    {
        "name": 'Ice',
        "ingredients": [ 'amn', 'shael', 'jah', 'lo'],
    },
    {
        "name": 'Malice',
        "ingredients": [ 'ith', 'el', 'eth'],
    },
    {
        "name": 'Lawbringer',
        "ingredients": [ 'amn', 'lem', 'ko'],
    },
    {
        "name": 'Crescent Moon',
        "ingredients": [ 'shael', 'um', 'tir'],
    },
    {
        "name": 'Wind',
        "ingredients": [ 'sur', 'el'],
    },
    {
        "name": 'Nadir',
        "ingredients": [ 'nef', 'tir'],
    },
    {
        "name": 'Bramble',
        "ingredients": [ 'ral', 'ohm', 'sur', 'eth'],
    },
    {
        "name": 'Lionheart',
        "ingredients": [ 'hel', 'lum', 'fal'],
    },
    {
        "name": 'Grief',
        "ingredients": [ 'eth', 'tir', 'lo', 'mal', 'ral'],
    },
    {
        "name": 'Destruction',
        "ingredients": [ 'vex', 'lo', 'ber', 'jah', 'ko'],
    },
    {
        "name": 'Rain',
        "ingredients": [ 'ort', 'mal', 'ith'],
    },
    {
        "name": 'Chains of Honor',
        "ingredients": [ 'dol', 'um', 'ber', 'ist'],
    },
    {
        "name": 'Radiance',
        "ingredients": [ 'nef', 'sol', 'ith'],
    },
    {
        "name": 'Passion',
        "ingredients": [ 'dol', 'ort', 'eld', 'lem'],
    },
    {
        "name": 'Sanctuary',
        "ingredients": [ 'ko', 'ko', 'mal'],
    },
    {
        "name": 'Doom',
        "ingredients": [ 'hel', 'ohm', 'um', 'lo', 'cham'],
    },
    {
        "name": 'Venom',
        "ingredients": [ 'tal', 'dol', 'mal'],
    },
    {
        "name": 'Stone',
        "ingredients": [ 'shael', 'um', 'pul', 'lum'],
    },
    {
        "name": 'Chaos',
        "ingredients": [ 'fal', 'ohm', 'um'],
    },
    {
        "name": 'Call To Arms',
        "ingredients": [ 'amn', 'ral', 'mal', 'ist', 'ohm'],
    },
    {
        "name": 'Exile',
        "ingredients": [ 'vex', 'ohm', 'ist', 'dol'],
    },
    {
        "name": 'Heart of the Oak',
        "ingredients": [ 'ko', 'vex', 'pul', 'thul'],
    },
    {
        "name": 'Voice of Reason',
        "ingredients": [ 'lem', 'ko', 'el', 'eld'],
    },
    {
        "name": 'Ancient\'s Pledge',
        "ingredients": [ 'ral', 'ort', 'tal'],
    },
    {
        "name": 'Eternity',
        "ingredients": [ 'amn', 'ber', 'ist', 'sol', 'sur'],
    },
    {
        "name": 'Dream',
        "ingredients": [ 'io', 'jah', 'pul'],
    },
    {
        "name": 'Dragon',
        "ingredients": [ 'sur', 'lo', 'sol'],
    },
    {
        "name": 'Steel',
        "ingredients": [ 'tir', 'el'],
    },
    {
        "name": 'Stealth',
        "ingredients": [ 'tal', 'eth'],
    },

    {
        "name": 'Rhyme',
        "ingredients": [ 'shael', 'eth'],
    },
    {
        "name": 'Faith',
        "ingredients": [ 'ohm', 'jah','lem', 'eld'],
    },
    {
        "name": 'Spirit',
        "ingredients": [ 'tal', 'thul','ort', 'amn'],
    },
    {
        "name": 'Bone',
        "ingredients": [ 'sol', 'um','um'],
    },
    {
        "name": 'Principle',
        "ingredients": [ 'ral', 'gul','eld'],
    },
    {
        "name": 'Prudence',
        "ingredients": [ 'mal', 'tir'],
    },
    {
        "name": 'Wealth',
        "ingredients": [ 'lem', 'ko', 'tir'],
    },

    {
        "name": 'Fury',
        "ingredients": [ 'jah', 'gul', 'eth'],
    },
    {
        "name": 'Smoke',
        "ingredients": [ 'nef', 'lum'],
    },
    {
        "name": 'Death',
        "ingredients": [ 'hel', 'el','vex', 'ort','gul'],
    },
    {
        "name": 'Zephyr',
        "ingredients": [ 'ort', 'eth'],
    },
    {
        "name": 'Holy Thunder',
        "ingredients": [ 'eth', 'ral', 'ort', 'tal'],
    },
    {
        "name": 'Myth',
        "ingredients": [ 'hel', 'amn', 'nef'],
    },
    {
        "name": 'Kingslayer',
        "ingredients": [ 'mal', 'um', 'gul', 'fal'],
    },
    {
        "name": 'Enlightenment',
        "ingredients": [ 'pul', 'ral', 'sol'],
    },
    {
        "name": 'Hand of Justice',
        "ingredients": [ 'sur', 'cham', 'amn', 'lo'],
    },
    {
        "name": 'Gloom',
        "ingredients": [ 'fal', 'um', 'pul'],
    },
    {
        "name": 'Honor',
        "ingredients": [ 'amn', 'el', 'ith', 'tir', 'sol'],
    },
    {
        "name": 'King\'s Grace',
        "ingredients": [ 'amn', 'ral', 'thul'],
    },
    {
        "name": 'Memory',
        "ingredients": [ 'lum', 'io', 'sol', 'eth'],
    },
    {
        "name": 'Strength',
        "ingredients": [ 'amn', 'tir'],
    },

];

export default RuneWords;