function ajouterJours(date, jours) {
  if (!date) return "";
  const valeur = new Date(`${date}T12:00:00`);
  if (Number.isNaN(valeur.getTime())) return "";
  valeur.setDate(valeur.getDate() + jours);
  return valeur.toISOString().slice(0, 10);
}

function joursEntre(debut, fin) {
  if (!debut || !fin) return "";
  const dateDebut = new Date(`${debut}T12:00:00`);
  const dateFin = new Date(`${fin}T12:00:00`);
  if (Number.isNaN(dateDebut.getTime()) || Number.isNaN(dateFin.getTime())) return "";
  return Math.max(0, Math.round((dateFin - dateDebut) / 86_400_000));
}

function moyenne(valeurs) {
  if (valeurs.length === 0) return "—";
  return (valeurs.reduce((total, valeur) => total + valeur, 0) / valeurs.length).toFixed(1);
}

function nombresValides(valeurs) {
  return valeurs.map(Number).filter((valeur) => Number.isFinite(valeur) && valeur >= 0);
}

function estCloturee(situation) {
  return situation.statut === "Clôturée";
}

function estNonRetenue(situation) {
  return situation.statut === "Analyse réalisée — non prise en charge";
}

function estEffective(situation) {
  return !estCloturee(situation) && !estNonRetenue(situation) && Boolean(situation.dateSignature);
}

function estPreparatoire(situation) {
  return !estEffective(situation) && !estCloturee(situation) && !estNonRetenue(situation);
}

export function calculerIndicateursBilan(situations) {
  const delaisTotaux = nombresValides(
    situations.map((situation) => joursEntre(situation.dateSollicitation, situation.dateSignature))
  );

  const delaisUM = nombresValides(
    situations.map((situation) => {
      const total = joursEntre(situation.dateSollicitation, situation.dateSignature);
      if (total === "") return "";
      const suspension = joursEntre(situation.dateDemandeComplementESMS, situation.dateRetourESMS);
      return Math.max(0, Number(total) - Number(suspension || 0));
    })
  );

  const dureesParcours = nombresValides(
    situations.map((situation) =>
      joursEntre(
        situation.dateSignature,
        situation.dateFinReelle || ajouterJours(situation.dateSignature, 90)
      )
    )
  );

  return {
    total: situations.length,
    effectives: situations.filter(estEffective).length,
    preparatoires: situations.filter(estPreparatoire).length,
    cloturees: situations.filter(estCloturee).length,
    nonRetenues: situations.filter(estNonRetenue).length,
    prolongations: situations.filter(
      (situation) => situation.prolongation || situation.statut === "Prolongation à arbitrer"
    ).length,
    delaiTotalMoyen: moyenne(delaisTotaux),
    delaiUMMoyen: moyenne(delaisUM),
    dureeMoyenne: moyenne(dureesParcours),
    vadTotal: situations.reduce((total, situation) => total + Number(situation.vadParSemaine || 0), 0),
    kmMoyens: moyenne(nombresValides(situations.map((situation) => situation.trajetKm))),
    minutesMoyennes: moyenne(nombresValides(situations.map((situation) => situation.trajetMinutes))),
    modaliteVad: situations.filter((situation) => situation.modalite === "VAD").length,
    modaliteStructure: situations.filter((situation) => situation.modalite === "Structure").length,
    modaliteMixte: situations.filter((situation) => situation.modalite === "Mixte").length,
  };
}
