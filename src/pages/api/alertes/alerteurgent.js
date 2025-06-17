import db from "../../../../lib/fireStores";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ message: "UID manquant" });
    }

    try {
      const docRef = db.collection("users").doc(uid);
      const userSnap = await docRef.get();

      if (!userSnap.exists) {
        return res.status(404).json({ message: "User introuvable !" });
      }

      const ref = await docRef.collection("notifications").get();
      const table = [];
      ref.forEach((doc) => {
        table.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json({ message: "Donnée récupérée !", table });
    } catch (error) {
      console.error("Erreur API alertes:", error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  } else {
    // Pour toute autre méthode HTTP, on renvoie une réponse claire
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ message: `Méthode ${req.method} non autorisée.` });
  }
}
