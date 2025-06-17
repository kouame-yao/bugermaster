import { serialize } from "cookie";

export default function handler(req, res) {
  // Supprime le cookie "token"
  res.setHeader(
    "Set-Cookie",
    serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    })
  );

  res.status(200).json({ message: "Déconnecté" });
}
