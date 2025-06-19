import db from "../../../../lib/fireStores";
import ad from "../../../../lib/fireStoresadmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }
  // date notif
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const dateFormatted = `${day}/${month}`;

  const { uid, value, categorie, date, description } = req.body;

  // Validation des champs
  if (!uid || typeof value !== "number" || !categorie || !description) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  if (!value) {
    return res.status(405).json({ message: "Montant manquant !" });
  }

  try {
    const docRef = db.collection("users").doc(uid);
    const userSnap = await docRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: "Utilisateur introuvable !" });
    }

    const data = userSnap.data();
    const currentSolde = data.newCat?.[categorie];

    if (currentSolde === undefined) {
      return res
        .status(400)
        .json({ message: `Catégorie '${categorie}' introuvable.` });
    }
    // recherche devise

    const devSnap = await docRef.collection("devise").doc("dev").get();

    if (!devSnap.exists) {
      // Gère le cas où le document n'existe pas
      return res.status(400).json({ message: "Devise manquant !" });
    }

    const devise = devSnap.data().devise;

    const nouveauSolde = currentSolde - value;
    if (nouveauSolde < 0) {
      return res.status(400).json({
        message: `Fonds insuffisants dans la catégorie '${categorie}'.`,
      });
    }

    // Calcul des dates
    const dateNow = date ? new Date(date) : new Date();
    const mois = `${dateNow.getFullYear()}-${String(
      dateNow.getMonth() + 1
    ).padStart(2, "0")}`;
    const annee = String(dateNow.getFullYear());
    const numeroMois = dateNow.getMonth() + 1;
    const trimestre =
      numeroMois <= 3
        ? "Q1"
        : numeroMois <= 6
        ? "Q2"
        : numeroMois <= 9
        ? "Q3"
        : "Q4";

    // Préparation dépense
    const depense = {
      montant: value,
      categorie: categorie,
      date: date,
      description: description,
    };

    // Mise à jour solde catégorie
    await docRef.update({
      [`newCat.${categorie}`]: nouveauSolde,
    });

    // Mise à jour mensuelle
    const depenseRef = docRef.collection("depense").doc(mois);
    const solde = data.soldeglobal;

    await depenseRef.set({ solde }, { merge: true });
    await depenseRef.set(
      {
        details: ad.FieldValue.arrayUnion(depense),
        total: ad.FieldValue.increment(value),
      },
      { merge: true }
    );

    // Mise à jour annuelle
    const anneeRef = docRef.collection("depenses_annee").doc(annee);
    await anneeRef.set(
      {
        totaldepenseAnnuel: ad.FieldValue.increment(value),
        annee: annee,
        uid: uid,
        [`mois.${mois}`]: ad.FieldValue.increment(value),
        [`trimestres.${trimestre}`]: ad.FieldValue.increment(value),
        total_annuel: ad.FieldValue.increment(value),
        details: ad.FieldValue.arrayUnion(depense),
      },
      { merge: true }
    );

    // --- GESTION DES ALERTES ---
    const alerts = [];
    const notificationsRef = docRef.collection("notifications");

    // 1. Solde faible catégorie (< 20 €)
    if (nouveauSolde < 5000) {
      alerts.push({
        type: "alerte",
        title: "Solde faible",
        message: `Votre solde pour la catégorie '${categorie}' est inférieur à 20 ${devise}.`,
        createdAt: dateFormatted,
        read: false,
      });
    }

    // 2. Dépenses mensuelles > 80% du solde global
    const depenseSnap = await depenseRef.get();
    const totalMois = depenseSnap.exists ? depenseSnap.data().total || 0 : 0;
    const seuil = solde * 0.8;
    if (totalMois >= seuil) {
      alerts.push({
        type: "alerte",
        title: "Dépenses élevées",
        message: `Vous avez atteint 80% de votre budget pour le mois de ${mois}.`,
        createdAt: dateFormatted,
        read: false,
      });
    }

    // 3. Aucune dépense depuis 3 jours
    // Récupérer la dernière dépense toutes catégories
    const lastDepenseQuery = await docRef
      .collection("depense")
      .orderBy("details.date", "desc")
      .limit(1)
      .get();

    let lastDate = null;
    lastDepenseQuery.forEach((doc) => {
      const details = doc.data()?.details || [];
      if (details.length > 0) {
        lastDate = new Date(details[details.length - 1].date);
      }
    });

    if (lastDate) {
      const diffTime = Date.now() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 3) {
        alerts.push({
          type: "rappel",
          title: "Aucune dépense depuis 3 jours",
          message: `Vous n’avez rien dépensé depuis ${diffDays} jours.`,
          createdAt: dateFormatted,
          read: false,
        });
      }
    }

    // 4. Top catégorie du mois
    const toutesDepenses = depenseSnap.exists
      ? depenseSnap.data().details || []
      : [];
    const statsParCategorie = {};
    for (const d of toutesDepenses) {
      statsParCategorie[d.categorie] =
        (statsParCategorie[d.categorie] || 0) + d.montant;
    }
    let topCategorie = null;
    let maxMontant = 0;
    for (const cat in statsParCategorie) {
      if (statsParCategorie[cat] > maxMontant) {
        maxMontant = statsParCategorie[cat];
        topCategorie = cat;
      }
    }
    if (topCategorie) {
      alerts.push({
        type: "statistique",
        title: "Top catégorie du mois",
        message: `La catégorie '${topCategorie}' est la plus dépensée avec ${maxMontant} ${devise} ce mois-ci.`,
        createdAt: dateFormatted,
        read: false,
      });
    }

    // 5. Rappel fin de mois (jour -1 ou dernier jour)
    const today = new Date();
    const day = today.getDate();
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    if (day >= lastDayOfMonth - 1) {
      alerts.push({
        type: "rappel",
        title: "Fin du mois",
        message: `Le mois se termine bientôt. Consultez vos statistiques !`,
        createdAt: dateFormatted,
        read: false,
      });
    }

    // Envoi des alertes en base
    for (const alert of alerts) {
      await notificationsRef.add(alert);
    }

    return res.status(200).json({
      message: `Dépense enregistrée reste:${nouveauSolde} , notif:${alerts.length}`,
      reste: nouveauSolde.toLocaleString("fr-FR"),
      mois: date,
      alertesEnvoyees: alerts.length,
    });
  } catch (error) {
    console.error("Erreur API depense :", error);
    return res
      .status(500)
      .json({ message: "Erreur serveur", error: error.message });
  }
}
