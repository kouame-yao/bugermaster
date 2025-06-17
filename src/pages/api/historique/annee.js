import db from "../../../../lib/fireStores";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { uid } = req.body;

    try {
      const docRef = db.collection("users").doc(uid);
      const userSnap = await docRef.get();
      if (!userSnap.exists) {
        return res.status(405).json({ message: "User introuvable !" });
      }

      const ref = await docRef.collection("depenses_annee").get();
      const table = [];
      ref.forEach((doc) => {
        table.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json({ message: "Donnée recup !", table: table });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
