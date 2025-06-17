import db from "../../../../lib/fireStores";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { uid, category, value } = req.body;

    try {
      const docRef = db.collection("users").doc(uid);
      const userSnap = await docRef.get();
      if (!userSnap.exists) {
        return res.status(405).json({ message: "User introuvable" });
      }

      await docRef.update({
        [`categorie.${category}`]: value,
      });

      await docRef.set(
        {
          newCat: {
            [category]: value,
          },
        },
        { merge: true }
      );

      res.status(200).json({ message: `Categorie ${category} modfier` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
