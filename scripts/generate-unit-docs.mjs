#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CONVERSION_DIR = path.join(ROOT, 'client/src/data/conversion');
const EN_FILE = path.join(ROOT, 'client/src/data/localization/units/en.json');
const OUT_DIR = path.join(ROOT, 'docs/measures');

const SYSTEM_NAMES = {
  SI: 'SI (International System of Units)',
  US_CUSTOMARY: 'US Customary',
  US_CUSTOMARY_FLUID: 'US Customary — Fluid Measures',
  US_CUSTOMARY_DRY: 'US Customary — Dry Measures',
  US_SURVEY: 'US Survey System',
  US_FDA: 'US FDA Nutrition-Labeling',
  IMPERIAL: 'British Imperial',
  IMPERIAL_SURVEY: 'British Survey (Gunter)',
  APOTHECARIES: "Apothecaries' System",
  TROY: 'Troy Weight',
  ASTRONOMICAL: 'Astronomical',
  FRENCH_TRADITIONAL: 'French Traditional (Pied-du-Roi)',
  TYPOGRAPHIC_AMERICAN: 'Anglo-American Typographic System',
  JAPANESE: 'Japanese Traditional (Shakkan-hō)',
  KOREAN: 'Korean Traditional',
  CHINESE: 'Chinese Traditional',
  HONG_KONG: 'Hong Kong Traditional',
  SOUTH_ASIAN: 'South Asian Traditional',
  THAI: 'Thai Traditional',
  GERMAN: 'German Historical',
  RUSSIAN: 'Russian Traditional',
  SPANISH: 'Spanish Traditional',
  ANCIENT_EGYPTIAN: 'Ancient Egyptian',
  ANCIENT_GREEK: 'Ancient Greek',
  ANCIENT_ROMAN: 'Ancient Roman',
  ANCIENT_HEBREW: 'Ancient Hebrew',
  DOMAIN: 'Domain-Specific (no governing system)',
  NONE: 'Unclassified',
};

function loadAllUnits() {
  const en = JSON.parse(fs.readFileSync(EN_FILE, 'utf8'));
  const files = fs.readdirSync(CONVERSION_DIR).filter(f => f.endsWith('.json')).sort();
  const allUnits = [];

  for (const file of files) {
    const cat = JSON.parse(fs.readFileSync(path.join(CONVERSION_DIR, file), 'utf8'));
    for (const unit of cat.units) {
      const enName = en[unit.name] || unit.name;
      allUnits.push({
        categoryId: cat.id,
        categoryName: cat.name,
        baseSISymbol: cat.baseSISymbol || cat.baseUnit,
        id: unit.id,
        name: unit.name,
        enName,
        symbol: unit.symbol,
        factor: unit.factor,
        offset: unit.offset,
        mathFunction: unit.mathFunction,
        unitType: unit.unitType || '',
        measurementSystem: unit.measurementSystem || 'NONE',
      });
    }
  }

  return allUnits;
}

function nonLinearNote(unit) {
  if (unit.offset !== undefined || unit.mathFunction !== undefined) {
    return ' †';
  }
  return '';
}

function formatFactor(factor) {
  if (factor === 0) return '0';
  const abs = Math.abs(factor);
  if (abs >= 0.001 && abs < 1e9) {
    return String(factor);
  }
  return factor.toExponential();
}

function generateUnitsTable(units) {
  const header = '| Symbol | English Name | Category | Base SI Symbol |';
  const sep    = '|--------|-------------|----------|----------------|';
  const rows = units.map(u =>
    `| \`${u.symbol}\` | ${u.enName}${nonLinearNote(u)} | ${u.categoryName} | ${u.baseSISymbol} |`
  );
  return [header, sep, ...rows].join('\n');
}

function generateCompareSection(categoryName, units, baseSISymbol) {
  const header = `| Symbol | English Name | 1 unit = (base SI) |`;
  const sep    = `|--------|-------------|-------------------|`;
  const rows = units.map(u =>
    `| \`${u.symbol}\` | ${u.enName}${nonLinearNote(u)} | ${formatFactor(u.factor)} ${baseSISymbol} |`
  );
  return [`### ${categoryName}`, '', [header, sep, ...rows].join('\n')].join('\n');
}

function generateBySystemSection(systemKey, units) {
  const header = `| Symbol | English Name | 1 unit = (base SI) |`;
  const sep    = `|--------|-------------|-------------------|`;
  const rows = units.map(u =>
    `| \`${u.symbol}\` | ${u.enName}${nonLinearNote(u)} | ${formatFactor(u.factor)} ${u.baseSISymbol} |`
  );
  const sysName = SYSTEM_NAMES[systemKey] || systemKey;
  return [`## ${sysName}`, '', [header, sep, ...rows].join('\n')].join('\n');
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const allUnits = loadAllUnits();

  const footnote = '\n\n† Non-linear conversion (uses an offset or math function); "1 unit = factor × base" is not the full formula.\n';

  // ----------------------------------------------------------------
  // 1. units.md — every unit, one row per unit, sorted by category > symbol
  // ----------------------------------------------------------------
  const sortedUnits = [...allUnits].sort((a, b) => {
    const cat = a.categoryName.localeCompare(b.categoryName);
    if (cat !== 0) return cat;
    return a.symbol.localeCompare(b.symbol);
  });

  const unitsLines = [
    '# Unit Reference',
    '',
    'Every unit in the converter, sorted by category then symbol. Symbols, English names, quality (category), base SI symbol, and value of 1 unit in base SI.',
    '',
    '| Symbol | English Name | Category | Base SI Symbol | 1 unit in base SI |',
    '|--------|-------------|----------|----------------|-------------------|',
    ...sortedUnits.map(u =>
      `| \`${u.symbol}\` | ${u.enName}${nonLinearNote(u)} | ${u.categoryName} | ${u.baseSISymbol} | ${formatFactor(u.factor)} |`
    ),
    footnote,
  ];
  fs.writeFileSync(path.join(OUT_DIR, 'units.md'), unitsLines.join('\n'));
  console.log('Written docs/measures/units.md');

  // ----------------------------------------------------------------
  // 2. compare-all.md — one section per category
  // ----------------------------------------------------------------
  const byCategory = {};
  for (const u of allUnits) {
    if (!byCategory[u.categoryId]) {
      byCategory[u.categoryId] = { name: u.categoryName, baseSISymbol: u.baseSISymbol, units: [] };
    }
    byCategory[u.categoryId].units.push(u);
  }

  const compareLines = [
    '# Compare All Units by Category',
    '',
    'One section per measurement category. Each row shows how many base SI units one unit equals.',
    '',
  ];
  for (const [, cat] of Object.entries(byCategory)) {
    compareLines.push(generateCompareSection(cat.name, cat.units, cat.baseSISymbol));
    compareLines.push('');
  }
  compareLines.push(footnote);
  fs.writeFileSync(path.join(OUT_DIR, 'compare-all.md'), compareLines.join('\n'));
  console.log('Written docs/measures/compare-all.md');

  // ----------------------------------------------------------------
  // 3. units-by-system.md — one section per measurement system
  // ----------------------------------------------------------------
  const bySystem = {};
  for (const u of allUnits) {
    const sys = u.measurementSystem;
    if (!bySystem[sys]) bySystem[sys] = [];
    bySystem[sys].push(u);
  }

  const systemOrder = [
    'SI',
    'US_CUSTOMARY', 'US_CUSTOMARY_FLUID', 'US_CUSTOMARY_DRY', 'US_SURVEY', 'US_FDA',
    'IMPERIAL', 'IMPERIAL_SURVEY',
    'TROY', 'APOTHECARIES',
    'ASTRONOMICAL',
    'TYPOGRAPHIC_AMERICAN', 'FRENCH_TRADITIONAL',
    'JAPANESE', 'KOREAN', 'CHINESE', 'HONG_KONG',
    'SOUTH_ASIAN', 'THAI',
    'GERMAN', 'RUSSIAN', 'SPANISH',
    'ANCIENT_EGYPTIAN', 'ANCIENT_GREEK', 'ANCIENT_ROMAN', 'ANCIENT_HEBREW',
    'DOMAIN',
    'NONE',
  ];

  const bySystemLines = [
    '# Units by Measurement System',
    '',
    'One section per measurement system or tradition.',
    '',
  ];

  const ordered = [...systemOrder.filter(k => bySystem[k]), ...Object.keys(bySystem).filter(k => !systemOrder.includes(k))];

  for (const sys of ordered) {
    if (!bySystem[sys]) continue;
    bySystemLines.push(generateBySystemSection(sys, bySystem[sys]));
    bySystemLines.push('');
  }
  bySystemLines.push(footnote);
  fs.writeFileSync(path.join(OUT_DIR, 'units-by-system.md'), bySystemLines.join('\n'));
  console.log('Written docs/measures/units-by-system.md');
}

main();
