import { serialize } from "cookie";

export default function handler(req, res) {
  // Supprime le cookie "token" avec les mêmes options que la création
  res.setHeader(
    "Set-Cookie",
    serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // moins restrictif que strict, mieux pour Safari
      path: "/",
      expires: new Date(0), // Date passée = expiration immédiate
      maxAge: 0,
    })
  );

  res.status(200).json({ message: "Déconnecté" });
}
