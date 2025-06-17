import db from "../../../../lib/fireStores";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ message: "Paramètre uid manquant" });
    }

    try {
      const notificationsRef = db
        .collection("users")
        .doc(uid)
        .collection("notifications");

      // Récupérer toutes les notifications où read === false
      const snapshot = await notificationsRef.where("read", "==", false).get();

      if (snapshot.empty) {
        return res
          .status(400)
          .json({ message: "Aucune notification non lue trouvée" });
      }

      // Firestore ne permet pas d'update en masse directement,
      // on utilise un batch pour faire plusieurs updates atomiquement
      const batch = db.batch();

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();

      res
        .status(200)
        .json({
          message: "Toutes les notifications ont été marquées comme lues",
        });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Méthode ${req.method} non autorisée`);
  }
}
