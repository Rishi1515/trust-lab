import type { ScenarioRecord } from '../types/scenario';

/**
 * Startup and test-time integrity checks for the scenario bank. Returns a list of problems;
 * an empty list means the bank is usable. The app refuses to start a run if this is non-empty.
 */
export function validateScenario(s: ScenarioRecord): string[] {
  const problems: string[] = [];
  const where = `Scenario ${s.id}`;
  const ids = s.actions.map((a) => a.id);

  if (s.actions.length !== 3) problems.push(`${where}: needs exactly 3 actions, has ${s.actions.length}.`);
  if (new Set(ids).size !== ids.length) problems.push(`${where}: action ids are not unique.`);
  if (new Set(s.actions.map((a) => a.label)).size !== s.actions.length) problems.push(`${where}: action labels are not unique.`);
  if (s.actions.filter((a) => a.investigative).length > 1) problems.push(`${where}: more than one investigative action.`);
  if (!ids.includes(s.correctActionId)) problems.push(`${where}: correctActionId "${s.correctActionId}" is not an action.`);
  if (s.facts.length < 3) problems.push(`${where}: needs at least 3 facts.`);

  const { correct, incorrect } = s.advice;
  if (correct.actionId !== s.correctActionId) problems.push(`${where}: correct advice must recommend the correct action.`);
  if (incorrect.actionId === s.correctActionId) problems.push(`${where}: incorrect advice must not recommend the correct action.`);
  if (!ids.includes(incorrect.actionId)) problems.push(`${where}: incorrect advice recommends an unknown action.`);
  if (!incorrect.reasoningError?.trim()) problems.push(`${where}: incorrect advice needs a documented reasoningError.`);
  if (correct.reasoningError) problems.push(`${where}: correct advice should not carry a reasoningError.`);
  if (!correct.explanation.trim() || !incorrect.explanation.trim()) problems.push(`${where}: both advice variants need an explanation.`);
  for (const a of s.actions) if (!a.outcome.trim()) problems.push(`${where}: action "${a.id}" needs an outcome.`);
  if (!s.consequence.trim() || !s.learningNote.trim()) problems.push(`${where}: consequence and learning note are required.`);
  return problems;
}

export function validateBank(scored: readonly ScenarioRecord[], warmup: ScenarioRecord): string[] {
  const problems = [...scored, warmup].flatMap(validateScenario);
  const ids = scored.map((s) => s.id);
  if (new Set([...ids, warmup.id]).size !== ids.length + 1) problems.push('Scenario ids are not unique.');

  const perDomain = new Map<string, number>();
  for (const s of scored) perDomain.set(s.domain, (perDomain.get(s.domain) ?? 0) + 1);
  if (perDomain.size !== 6) problems.push(`Expected 6 domains, found ${perDomain.size}.`);
  for (const [domain, n] of perDomain) if (n !== 2) problems.push(`Domain ${domain} has ${n} scenarios; expected 2.`);
  return problems;
}
