import db from "../../../../lib/fireStores";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { uid, value } = req.body;

    try {
      const docRef = db.collection("users").doc(uid);
      const userSnap = await docRef.get();
      if (!userSnap.exists) {
        return res.status(405).json({ message: "User introuvable" });
      }

      await docRef.update({
        categorie: value,
      });

      await docRef.update({
        newCat: value,
      });

      res.status(200).json({ message: `Categorie modfier` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
