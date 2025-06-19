import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import db from "../../../../lib/fireStores";

const SECRET_KEY = process.env.JWT_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { uid, email, displayName } = req.body; // Tu passes ces infos depuis le client

  if (!uid || !email || !displayName) {
    return res.status(400).json({ message: "Informations manquantes" });
  }

  const docRef = db.collection("users").doc(uid);

  const userSnapshot = await docRef.get();

  if (!userSnapshot.exists) {
    // Nouvel utilisateur => on crée avec catégories à zéro
    await docRef.set({
      email,
      displayName,
      categorie: {
        Alimentation: 0,
        Facture: 0,
        Loisir: 0,
        Sante: 0,
        Shopping: 0,
        Transport: 0,
      },
    });
  } else {
    // Utilisateur existant, ne rien changer ici ou juste mettre à jour ce qui change
    await docRef.set(
      {
        email,
        displayName,
      },
      { merge: true }
    );
  }
  // Crée le JWT
  const token = jwt.sign({ uid, email }, SECRET_KEY, {
    expiresIn: "5d",
  });

  // Stocke le token dans un cookie sécurisé
  const cookie = serialize("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 5, // 5 jours
  });

  res.setHeader("Set-Cookie", cookie);
  res.status(200).json({ message: "Session créée avec token." });
}
