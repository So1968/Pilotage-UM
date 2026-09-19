export const TAILLE_IMPORT_MAX = 5 * 1024 * 1024;

export function lireStockageJson(cle, valeurParDefaut) {
  try {
    const brut = localStorage.getItem(cle);
    return brut ? JSON.parse(brut) : valeurParDefaut;
  } catch {
    return valeurParDefaut;
  }
}

export function ecrireStockageJson(cle, valeur) {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur));
    return { ok: true, erreur: "" };
  } catch (erreur) {
    return {
      ok: false,
      erreur: erreur?.name === "QuotaExceededError"
        ? "Espace de stockage du navigateur insuffisant. Faire un export JSON puis libérer de l’espace."
        : "Sauvegarde locale impossible. Faire immédiatement un export JSON.",
    };
  }
}

export function horodatageFichier(date = new Date()) {
  const deux = (valeur) => String(valeur).padStart(2, "0");
  return `${date.getFullYear()}-${deux(date.getMonth() + 1)}-${deux(date.getDate())}_${deux(date.getHours())}-${deux(date.getMinutes())}`;
}

export function celluleCsvSecurisee(value) {
  let texte = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(texte)) texte = `'${texte}`;
  return `"${texte.replaceAll('"', '""')}"`;
}

export function validerSauvegarde(donnees) {
  if (!donnees || typeof donnees !== "object" || Array.isArray(donnees)) return false;
  if (donnees.outil !== "Pilotage UM") return false;
  if (!Array.isArray(donnees.situations) || !Array.isArray(donnees.equipe)) return false;
  if (donnees.structuresTrajet !== undefined && !Array.isArray(donnees.structuresTrajet)) return false;
  if (
    donnees.referentsMetiers !== undefined &&
    (donnees.referentsMetiers === null || typeof donnees.referentsMetiers !== "object" || Array.isArray(donnees.referentsMetiers))
  ) return false;
  return donnees.situations.every((situation) => situation && typeof situation === "object" && !Array.isArray(situation));
}
