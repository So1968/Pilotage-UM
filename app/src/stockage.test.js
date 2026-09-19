import test from "node:test";
import assert from "node:assert/strict";
import { celluleCsvSecurisee, horodatageFichier, validerSauvegarde } from "./stockage.js";

test("protège les cellules CSV interprétables comme formules", () => {
  assert.equal(celluleCsvSecurisee("=1+1"), '"\'=1+1"');
  assert.equal(celluleCsvSecurisee("texte"), '"texte"');
  assert.equal(celluleCsvSecurisee('a"b'), '"a""b"');
});

test("produit un nom de sauvegarde daté et stable", () => {
  assert.equal(horodatageFichier(new Date(2026, 8, 19, 7, 5)), "2026-09-19_07-05");
});

test("refuse une sauvegarde de forme incohérente", () => {
  assert.equal(validerSauvegarde({ outil: "Pilotage UM", situations: [], equipe: [] }), true);
  assert.equal(validerSauvegarde({ outil: "Pilotage UM", situations: {}, equipe: [] }), false);
  assert.equal(validerSauvegarde({ outil: "Autre", situations: [], equipe: [] }), false);
});
