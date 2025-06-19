import db from "../../../../lib/fireStores";
import adminBase from "../../../../lib/fireStoresdele";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { uid } = req.body;

    if (!uid) {
      return res.status(405).json({ message: "Uid manquant" });
    }

    try {
      const docRef = db.collection("users").doc(uid);
      const snapUser = await docRef.get();
      if (!snapUser.exists) {
        return res.status(400).json({ message: "User introuvable !" });
      }
      console.log("Suppression init pour uid :", uid);
      await adminBase.auth().deleteUser(uid);
      console.log("Utilisateur Auth supprimé");
      await docRef.delete();
      console.log("Document supprimé en Firestore");
      res.status(200).json({ message: "Compte supprimé avec succès" });
    } catch (err) {
      console.error("ERREUR API DELETE:", err);
      res.status(500).json({
        message: "Erreur lors de la suppression",
        error: err.message || err,
      });
    }
  }
}
