import test from "node:test";
import assert from "node:assert/strict";
import { calculerIndicateursBilan } from "./indicateurs.js";

test("calcule chaque suspension sur la bonne situation", () => {
  const resultat = calculerIndicateursBilan([
    {
      statut: "Situation effective en cours",
      dateSollicitation: "2026-01-01",
      dateSignature: "2026-01-11",
      dateDemandeComplementESMS: "",
      dateRetourESMS: "",
    },
    {
      statut: "Situation effective en cours",
      dateSollicitation: "2026-02-01",
      dateSignature: "2026-02-21",
      dateDemandeComplementESMS: "2026-02-05",
      dateRetourESMS: "2026-02-10",
    },
  ]);

  assert.equal(resultat.delaiTotalMoyen, "15.0");
  assert.equal(resultat.delaiUMMoyen, "12.5");
});

test("compte les modalités avec leur casse réelle", () => {
  const resultat = calculerIndicateursBilan([
    { statut: "Demande reçue", modalite: "VAD" },
    { statut: "Demande reçue", modalite: "Structure" },
    { statut: "Demande reçue", modalite: "Mixte" },
  ]);

  assert.equal(resultat.modaliteVad, 1);
  assert.equal(resultat.modaliteStructure, 1);
  assert.equal(resultat.modaliteMixte, 1);
});

test("utilise J+90 quand la fin réelle est absente", () => {
  const resultat = calculerIndicateursBilan([
    {
      statut: "Situation effective en cours",
      dateSignature: "2026-03-01",
      dateFinReelle: "",
    },
  ]);

  assert.equal(resultat.dureeMoyenne, "90.0");
});
