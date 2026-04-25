const COLORS = {
    accent:        '#C89B3C',
    info:          '#0DD3E6',
    error:         '#FF6B6B',
    dragActive:    '#6E40AA',
    dragBorder:    '#C89B3C',
    bgDefault:     '#0A1428',
    borderDefault: '#0DD3E6',
    matchHigh:     '#4CAF50',
    matchMid:      '#FFC107',
    matchLow:      '#FF9800',
};

const MATCH_THRESHOLDS = {
    HIGH: 80,
    MID:  70,
    LOW:  60,
};

const FILE = {
    MAX_SIZE_BYTES: 5 * 1024 * 1024,
    ALLOWED_TYPES:  ['application/pdf'],
};

const TIMING = {
    ERROR_RESET_MS: 4000,
};

const AVATAR_COLORS = [
    '#4CAF50', '#E91E63', '#FF9800', '#9C27B0',
    '#00BCD4', '#3F51B5', '#F44336', '#009688',
];

const MAX_VISIBLE_SKILLS = 3;

const SKILL_GAP = {
    MAX_DISPLAY:    5,
    ICONS:          ['🔥', '📘', '💡', '🚀', '⭐'],
    DEMAND_LABELS:  ['High demand', 'Medium demand', 'Growing field', 'Trending', 'Recommended'],
    TIME_ESTIMATES: ['~3 weeks to learn', '~2 weeks to learn', '~1 week to learn', '~4 weeks to learn', '~2 weeks to learn'],
};
