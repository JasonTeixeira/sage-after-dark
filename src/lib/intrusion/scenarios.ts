export type Scenario = { id: string; decoy: "403"; bypass: "seam" };
export const SCENARIOS: Scenario[] = [
  { id: "restricted-403", decoy: "403", bypass: "seam" },
];
export function scenarioForMonth(month: number): Scenario {
  const i = ((month % SCENARIOS.length) + SCENARIOS.length) % SCENARIOS.length;
  return SCENARIOS[i];
}
