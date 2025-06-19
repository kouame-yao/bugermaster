// /pages/api/solde/editesoldecategorie.js

import db from "../../../../lib/fireStores";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { uid, category, value } = req.body;

  if (!uid || !category || typeof value !== "number") {
    return res.status(400).json({ message: "Données invalides" });
  }

  try {
    const docRef = db.collection("users").doc(uid);
    const userSnap = await docRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const userData = userSnap.data();
    const currentCategories = userData?.categorie || {};

    // Mise à jour locale des catégories
    const updatedCategories = {
      ...currentCategories,
      [category]: value,
    };

    // Calcule le nouveau solde global
    const soldeglobal = Object.values(updatedCategories).reduce(
      (acc, val) => acc + Number(val),
      0
    );

    // Mise à jour complète dans Firestore
    await docRef.update({
      categorie: updatedCategories,
      newCat: updatedCategories,
      soldeglobal: soldeglobal,
    });

    return res.status(200).json({
      message: `Catégorie ${category} mise à jour`,
      soldeglobal,
    });
  } catch (error) {
    console.error("Erreur Firestore:", error);
    return res.status(500).json({ message: error.message });
  }
}
