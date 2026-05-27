/*
  Extension V26 — référents métier.
  But : corriger rapidement la fiche "Nouvelle situation" sans casser les données existantes.
  - Renomme visuellement Référente codée => Référente coordinatrice.
  - Renomme Binôme codé => Éducateur référent.
  - Ajoute les référents : médecin, neuropsy, psychomotricien, ergothérapeute, pair-aidant.
  - Conserve les valeurs dans le stockage local des situations quand une fiche est enregistrée.
*/

const STORAGE_KEY = "reperes-um-2-cadre-v3-charge-attribution";
const EXTRA_KEY = "pilotage-um-referents-metiers-v1";

const referentFields = [
  { key: "medecinReferentCode", label: "Médecin référent", hints: ["MEDECIN", "MÉDECIN", "MED", "DR", "DOCT"] },
  { key: "neuropsyReferentCode", label: "Neuropsy référent", hints: ["NEURO"] },
  { key: "psychomotricienReferentCode", label: "Psychomotricien référent", hints: ["PSYMO", "PSYCHOMOT"] },
  { key: "ergotherapeuteReferentCode", label: "Ergothérapeute référent", hints: ["ERGO"] },
  { key: "pairAidantReferentCode", label: "Pair-aidant référent", hints: ["PAIR", "AIDANT", "PA"] },
];

const metiersSupplementaires = [
  "MEDECIN",
  "IDE",
  "EDUC",
  "NEUROPSY",
  "PSYCHOMOT",
  "ERGO",
  "PAIR-AIDANT",
  "AUTRE",
];

let fusionEnCours = false;

function lireJson(cle, defaut) {
  try {
    const brut = window.localStorage.getItem(cle);
    return brut ? JSON.parse(brut) : defaut;
  } catch {
    return defaut;
  }
}

function ecrireJson(cle, valeur) {
  window.localStorage.setItem(cle, JSON.stringify(valeur));
}

function codeSituationCourant() {
  const prefixe = "UM-2026-";
  const codeVisible = document.querySelector(".bandeauEdition")
    ? document.querySelector(".codeLigne input")?.value
    : document.querySelector(".codeLigne input")?.value;
  const propre = String(codeVisible || "").replace(/\D/g, "");
  return propre ? `${prefixe}${propre.padStart(3, "0")}` : "";
}

function optionsDepuisSelectBase() {
  const selects = [...document.querySelectorAll("label.champ select")];
  const selectBase = selects.find((select) =>
    [...select.options].some((option) => /IDE|EDU|NEURO|PSYMO|MEDECIN|ERGO|PAIR/i.test(option.textContent || ""))
  );

  if (!selectBase) return [];

  return [...selectBase.options]
    .filter((option) => option.value)
    .map((option) => ({ value: option.value, label: option.textContent || option.value }));
}

function optionConvient(option, hints) {
  const texte = `${option.value} ${option.label}`.toUpperCase();
  return hints.some((hint) => texte.includes(hint));
}

function creerSelectReferent(champ, options, valeur) {
  const label = document.createElement("label");
  label.className = "champ champReferentMetier";
  label.dataset.referentField = champ.key;

  const span = document.createElement("span");
  span.textContent = champ.label;

  const select = document.createElement("select");
  select.dataset.referentField = champ.key;
  select.setAttribute("aria-label", champ.label);

  const optionVide = document.createElement("option");
  optionVide.value = "";
  optionVide.textContent = "Aucun / à définir";
  select.appendChild(optionVide);

  const optionsFiltrees = options.filter((option) => optionConvient(option, champ.hints));
  const liste = optionsFiltrees.length ? optionsFiltrees : options;

  liste.forEach((option) => {
    const item = document.createElement("option");
    item.value = option.value;
    item.textContent = option.label;
    select.appendChild(item);
  });

  select.value = valeur || "";
  select.addEventListener("change", () => sauvegarderReferentsCourants());

  label.appendChild(span);
  label.appendChild(select);
  return label;
}

function referentsCourantsDepuisDom() {
  const resultat = {};
  document.querySelectorAll("select[data-referent-field]").forEach((select) => {
    resultat[select.dataset.referentField] = select.value || "";
  });
  return resultat;
}

function sauvegarderReferentsCourants() {
  const code = codeSituationCourant();
  if (!code) return;

  const tous = lireJson(EXTRA_KEY, {});
  tous[code] = {
    ...(tous[code] || {}),
    ...referentsCourantsDepuisDom(),
  };
  ecrireJson(EXTRA_KEY, tous);
}

function fusionnerReferentsDansSituations(situations) {
  const extras = lireJson(EXTRA_KEY, {});
  if (!Array.isArray(situations)) return situations;

  return situations.map((situation) => {
    const code = situation?.code;
    const supplement = code ? extras[code] : null;
    if (!supplement) return situation;

    return {
      ...situation,
      ...supplement,
      educateurReferentCode: situation.educateurReferentCode || situation.binomeCode || "",
    };
  });
}

function patcherLocalStorage() {
  if (window.__pilotageReferentsPatchActif) return;
  window.__pilotageReferentsPatchActif = true;

  const setItemOriginal = Storage.prototype.setItem;

  Storage.prototype.setItem = function setItemPatche(cle, valeur) {
    if (cle === STORAGE_KEY && !fusionEnCours) {
      try {
        const situations = JSON.parse(String(valeur || "[]"));
        const fusionnees = fusionnerReferentsDansSituations(situations);
        valeur = JSON.stringify(fusionnees);
      } catch {
        // On laisse la sauvegarde normale se faire si le contenu n'est pas lisible.
      }
    }

    return setItemOriginal.call(this, cle, valeur);
  };
}

function fusionnerLocalStorageMaintenant() {
  try {
    fusionEnCours = true;
    const situations = lireJson(STORAGE_KEY, []);
    ecrireJson(STORAGE_KEY, fusionnerReferentsDansSituations(situations));
  } finally {
    fusionEnCours = false;
  }
}

function renommerChampsExistants() {
  document.querySelectorAll("label.champ span").forEach((span) => {
    const texte = span.textContent?.trim();
    if (texte === "Référente codée") {
      span.textContent = "Référente coordinatrice";
    }
    if (texte === "Binôme codé") {
      span.textContent = "Éducateur référent";
    }
  });

  document.querySelectorAll(".resumeSituationPrincipal span").forEach((span) => {
    span.title = "Référente coordinatrice · Éducateur référent";
  });
}

function ajouterMetiersDansSelects() {
  document.querySelectorAll("select").forEach((select) => {
    const textes = [...select.options].map((option) => option.textContent || "").join("|").toUpperCase();
    const ressembleSelectMetier = textes.includes("IDE") && textes.includes("EDUC") && textes.includes("AUTRE");
    if (!ressembleSelectMetier) return;

    metiersSupplementaires.forEach((metier) => {
      const existe = [...select.options].some((option) => option.value === metier || option.textContent === metier);
      if (!existe) {
        const option = document.createElement("option");
        option.value = metier;
        option.textContent = metier;
        select.appendChild(option);
      }
    });
  });
}

function injecterReferentsMetiers() {
  const deja = document.querySelector(".referentsMetiersAjoutes");
  if (deja) return;

  const spans = [...document.querySelectorAll("label.champ span")];
  const educateurSpan = spans.find((span) => span.textContent?.trim() === "Éducateur référent");
  const educateurLabel = educateurSpan?.closest("label.champ");
  if (!educateurLabel) return;

  const options = optionsDepuisSelectBase();
  if (!options.length) return;

  const code = codeSituationCourant();
  const extras = lireJson(EXTRA_KEY, {});
  const valeurs = code ? extras[code] || {} : {};

  const bloc = document.createElement("div");
  bloc.className = "referentsMetiersAjoutes";
  bloc.setAttribute("aria-label", "Référents métier complémentaires");

  const titre = document.createElement("h4");
  titre.textContent = "Référents par fonction";
  bloc.appendChild(titre);

  const note = document.createElement("p");
  note.textContent = "À renseigner si la situation mobilise ces fonctions. Les données restent codées.";
  bloc.appendChild(note);

  referentFields.forEach((champ) => {
    bloc.appendChild(creerSelectReferent(champ, options, valeurs[champ.key]));
  });

  educateurLabel.insertAdjacentElement("afterend", bloc);
}

function synchroniserValeursReferents() {
  const code = codeSituationCourant();
  if (!code) return;

  const extras = lireJson(EXTRA_KEY, {});
  const valeurs = extras[code] || {};

  document.querySelectorAll("select[data-referent-field]").forEach((select) => {
    const valeur = valeurs[select.dataset.referentField] || "";
    if (select.value !== valeur) select.value = valeur;
  });
}

function enrichirCartesSituations() {
  const situations = lireJson(STORAGE_KEY, []);
  const parCode = new Map(situations.map((situation) => [situation.code, situation]));

  document.querySelectorAll(".carteSituationRepliee").forEach((carte) => {
    const code = carte.querySelector(".resumeSituationPrincipal strong")?.textContent?.trim();
    const situation = parCode.get(code);
    const zone = carte.querySelector(".resumeSituationInfos");
    if (!code || !situation || !zone || zone.dataset.referentsAjoutes === "oui") return;

    const libelles = [
      ["Médecin", situation.medecinReferentCode],
      ["Neuropsy", situation.neuropsyReferentCode],
      ["Psychomot", situation.psychomotricienReferentCode],
      ["Ergo", situation.ergotherapeuteReferentCode],
      ["Pair-aidant", situation.pairAidantReferentCode],
    ].filter(([, valeur]) => Boolean(valeur));

    libelles.forEach(([libelle, valeur]) => {
      const span = document.createElement("span");
      span.className = "infoReferentMetier";
      span.textContent = `${libelle} ${valeur}`;
      zone.appendChild(span);
    });

    zone.dataset.referentsAjoutes = "oui";
  });
}

function attacherSauvegardeFormulaire() {
  document.querySelectorAll("form.formulaire").forEach((form) => {
    if (form.dataset.referentsSubmit === "oui") return;
    form.dataset.referentsSubmit = "oui";

    form.addEventListener(
      "submit",
      () => {
        sauvegarderReferentsCourants();
        setTimeout(() => {
          fusionnerLocalStorageMaintenant();
          enrichirCartesSituations();
        }, 150);
      },
      true
    );
  });

  const codeInput = document.querySelector(".codeLigne input");
  if (codeInput && codeInput.dataset.referentsCodeListener !== "oui") {
    codeInput.dataset.referentsCodeListener = "oui";
    codeInput.addEventListener("input", () => {
      setTimeout(synchroniserValeursReferents, 0);
    });
  }
}

function appliquerExtensionReferents() {
  renommerChampsExistants();
  ajouterMetiersDansSelects();
  injecterReferentsMetiers();
  synchroniserValeursReferents();
  attacherSauvegardeFormulaire();
  enrichirCartesSituations();
}

patcherLocalStorage();

const observateur = new MutationObserver(() => {
  window.requestAnimationFrame(appliquerExtensionReferents);
});

observateur.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

window.addEventListener("load", appliquerExtensionReferents);
setTimeout(appliquerExtensionReferents, 300);
