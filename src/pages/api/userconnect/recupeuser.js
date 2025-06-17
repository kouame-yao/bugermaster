import { parse } from "cookie";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY;

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Non autorisé, token manquant" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.status(200).json({ message: "Accès autorisé", user: decoded });
  } catch (err) {
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
}
