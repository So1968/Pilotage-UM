import test from "node:test";
import assert from "node:assert/strict";
import { fusionnerAnciensReferents } from "./referents.js";

test("reprend les référents conservés par l’ancienne extension", () => {
  const situations = [{ code: "UM-2026-001", referentCode: "IDE-01" }];
  const anciensReferents = {
    "UM-2026-001": {
      medecinReferentCode: "MED-01",
      ergotherapeuteReferentCode: "ERGO-01",
    },
  };

  assert.deepEqual(fusionnerAnciensReferents(situations, anciensReferents), [
    {
      code: "UM-2026-001",
      referentCode: "IDE-01",
      medecinReferentCode: "MED-01",
      ergotherapeuteReferentCode: "ERGO-01",
    },
  ]);
});

test("conserve une sauvegarde moderne sans référents séparés", () => {
  const situations = [{ code: "UM-2026-002", pairAidantReferentCode: "PAIR-01" }];
  assert.deepEqual(fusionnerAnciensReferents(situations), situations);
});
