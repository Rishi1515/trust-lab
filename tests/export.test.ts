import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { toCsv, toJson, toTrialRows, TRIAL_FIELDS, type ExportMeta } from '../src/experiment/export';
import { buildTrialResults, summarise } from '../src/experiment/scoring';
import { decision, fixtureScenario, planRow } from './fixtures';

const bank = ['F1', 'F2'].map(fixtureScenario);
const plan = [planRow(1, 'F1', true, 0.95, true), planRow(2, 'F2', false, 0.65, false)];
const results = buildTrialResults(plan, [decision(1, 'F1', 'right'), decision(2, 'F2', 'wrong')], bank);
const meta: ExportMeta = { seed: 'abc123', scenarioBankVersion: '1.0.0', appVersion: '1.0.0', buildSha: 'deadbee' };

const PERSONAL = /name|email|phone|address|ip|user.?agent|device|location|birth|gender|age\b|timestamp|date/i;

describe('export', () => {
  it('JSON contains the documented fields, versions and seed', () => {
    const json = JSON.parse(toJson(results, summarise(results), meta));
    expect(json.seed).toBe('abc123');
    expect(json.scenario_bank_version).toBe('1.0.0');
    expect(json.app_version).toBe('1.0.0');
    expect(json.build_sha).toBe('deadbee');
    expect(json.trials).toHaveLength(2);
    expect(Object.keys(json.trials[0])).toEqual([...TRIAL_FIELDS]);
    expect(json.summary.overreliance).toBe(1);
    expect(json.summary.appropriate_reliance).toBe(1);
  });

  it('CSV header matches the documented fields and has one row per trial', () => {
    const lines = toCsv(results, meta).trim().split('\n');
    expect(lines[0]).toBe(TRIAL_FIELDS.join(','));
    expect(lines).toHaveLength(3);
    expect(lines[2].split(',')[TRIAL_FIELDS.indexOf('pattern')]).toBe('overreliance');
  });

  it('contains no personal identifier fields', () => {
    const json = JSON.parse(toJson(results, summarise(results), meta));
    const keys = [...Object.keys(json), ...Object.keys(json.trials[0]), ...Object.keys(json.summary)];
    expect(keys.filter((k) => PERSONAL.test(k))).toEqual([]);
  });

  it('escapes CSV cells that contain commas or quotes', () => {
    const csv = toCsv(results, { ...meta, seed: 'a,"b"' });
    expect(csv.split('\n')[1].startsWith('"a,""b"""')).toBe(true);
  });

  it('data dictionary documents every exported trial field', () => {
    const doc = readFileSync('docs/data_dictionary.md', 'utf8');
    for (const field of TRIAL_FIELDS) expect(doc).toContain(`\`${field}\``);
    expect(toTrialRows(results, meta)).toHaveLength(2);
  });
});
