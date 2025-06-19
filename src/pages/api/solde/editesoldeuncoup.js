// /pages/api/solde/editesoldeuncoup.js

import db from "../../../../lib/fireStores";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { uid, value } = req.body;

  if (!uid || typeof value !== "object") {
    return res.status(400).json({ message: "Données invalides" });
  }

  try {
    const cleanCategories = {};

    for (const key in value) {
      if (
        key &&
        key !== "undefined" &&
        typeof value[key] === "number" &&
        !isNaN(value[key])
      ) {
        cleanCategories[key] = value[key];
      }
    }

    const somme = Object.values(cleanCategories).reduce((acc, v) => acc + v, 0);

    const docRef = db.collection("users").doc(uid);

    await docRef.update({
      categorie: cleanCategories,
      newCat: cleanCategories,
      soldeglobal: somme,
    });

    return res
      .status(200)
      .json({ message: "Solde global mis à jour", soldeglobal: somme });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return res.status(500).json({ message: error.message });
  }
}
