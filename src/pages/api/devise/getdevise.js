import db from "../../../../lib/fireStores";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { uid } = req.body;
    if (!uid) {
      return res
        .status(405)
        .json({ message: "Veillez remplir tout les champs !" });
    }
    try {
      const docRef = db.collection("users").doc(uid);
      const userSnap = await docRef.get();
      if (!userSnap.exists) {
        return res.status(405).json({ message: "User introuvable" });
      }

      const Refdevise = await docRef.collection("devise").doc("dev").get();
      const data = Refdevise.data();
      res.status(200).json({ message: `devise recup`, data });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
