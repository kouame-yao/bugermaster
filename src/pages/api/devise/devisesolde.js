import db from "../../../../lib/fireStores";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { uid, value } = req.body;
    if (!uid || !value) {
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

      const Refdevise = docRef.collection("devise").doc("dev");
      await Refdevise.set(
        {
          devise: value,
        },
        { merge: true }
      );
      res
        .status(200)
        .json({ message: `Vous avez changer la devise en ${value}` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
