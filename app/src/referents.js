export const referentsMetier = [
  { key: "medecinReferentCode", label: "Médecin référent", metiers: ["MEDECIN"] },
  { key: "neuropsyReferentCode", label: "Neuropsy référent", metiers: ["NEUROPSY"] },
  { key: "psychomotricienReferentCode", label: "Psychomotricien référent", metiers: ["PSYCHOMOT"] },
  { key: "ergotherapeuteReferentCode", label: "Ergothérapeute référent", metiers: ["ERGO"] },
  { key: "pairAidantReferentCode", label: "Pair-aidant référent", metiers: ["PAIR-AIDANT"] },
];

export function fusionnerAnciensReferents(situations, referentsSauvegardes = {}) {
  if (!Array.isArray(situations)) return [];
  return situations.map((situation) => ({
    ...situation,
    ...(referentsSauvegardes?.[situation.code] || {}),
  }));
}
