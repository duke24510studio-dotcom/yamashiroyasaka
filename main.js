export const ALL_VALUE = 'all';

export function setupFilters(elements, onChange) {
  const controls = [
    elements.yearFilter,
    elements.monthFilter,
    elements.typeFilter,
    elements.categoryFilter,
    elements.searchInput,
  ];

  controls.forEach((control) => {
    control.addEventListener('input', onChange);
    control.addEventListener('change', onChange);
  });
}

export function populateFilters(accidents, elements) {
  fillSelect(elements.yearFilter, unique(accidents, 'year'), 'すべて');
  fillSelect(elements.monthFilter, unique(accidents, 'month'), 'すべて');
  fillSelect(elements.typeFilter, unique(accidents, 'type'), 'すべて');
  fillSelect(elements.categoryFilter, unique(accidents, 'category'), 'すべて');
}

export function applyFilters(accidents, elements) {
  const year = elements.yearFilter.value;
  const month = elements.monthFilter.value;
  const type = elements.typeFilter.value;
  const category = elements.categoryFilter.value;
  const query = normalize(elements.searchInput.value);

  return accidents.filter((item) => {
    const matchesSelects =
      matches(year, item.year) &&
      matches(month, item.month) &&
      matches(type, item.type) &&
      matches(category, item.category);

    const searchTarget = normalize(`${item.location} ${item.detail ?? item.damagedPart ?? ''} ${item.cause}`);
    return matchesSelects && (!query || searchTarget.includes(query));
  });
}

export function describeActiveFilters(elements) {
  const labels = [
    ['年', elements.yearFilter],
    ['月', elements.monthFilter],
    ['事故区分', elements.typeFilter],
    ['カテゴリ', elements.categoryFilter],
  ]
    .filter(([, element]) => element.value !== ALL_VALUE)
    .map(([label, element]) => `${label}: ${element.selectedOptions[0]?.textContent ?? element.value}`);

  if (elements.searchInput.value.trim()) {
    labels.push(`検索: ${elements.searchInput.value.trim()}`);
  }

  return labels.length ? labels.join(' / ') : '全件を表示中';
}

function fillSelect(select, values, allLabel) {
  const current = select.value || ALL_VALUE;
  select.replaceChildren(option(ALL_VALUE, allLabel), ...values.map((value) => option(value, value)));
  select.value = values.includes(current) ? current : ALL_VALUE;
}

function unique(items, key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))].sort();
}

function matches(selected, value) {
  return selected === ALL_VALUE || selected === value;
}

function normalize(value) {
  return value.toLocaleLowerCase('ja-JP').trim();
}

function option(value, label) {
  const element = document.createElement('option');
  element.value = value;
  element.textContent = label;
  return element;
}
