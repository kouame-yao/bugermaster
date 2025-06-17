// pages/api/delete-collections.js
import db from "../../../../lib/fireStores"; // adapte le chemin selon ton projet

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { uid, collections } = req.body;

  if (!uid || !Array.isArray(collections)) {
    return res.status(400).json({ message: "uid et collections sont requis" });
  }

  try {
    const userRef = db.collection("users").doc(uid);

    for (const name of collections) {
      const colRef = userRef.collection(name);
      const snapshot = await colRef.get();

      if (snapshot.empty) {
        console.log(`⚠️  Collection "${name}" vide ou inexistante.`);
        continue;
      }

      const batch = db.batch();
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`✅ Collection "${name}" supprimée`);
    }

    return res
      .status(200)
      .json({ message: "Collections supprimées avec succès." });
  } catch (error) {
    console.error("Erreur de suppression :", error);
    return res.status(500).json({ message: "Erreur lors de la suppression." });
  }
}
