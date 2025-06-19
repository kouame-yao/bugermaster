import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Play } from "lucide-react";
import { toast } from "react-toastify";
import auth from "../../lib/firabase";

export default function Sign_up() {
  const url = process.env.NEXT_PUBLIC_LOCAL;

  async function Connect() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await fetch(`${url}/api/userconnect/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: user,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = "/home";
      } else {
        toast.error(data.message || "Erreur inconnue lors de la connexion.");
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
      toast.error("Connexion annulée ou échouée.");
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen w-full">
      <div className="bg-gray-100 w-full m-3 h-full shadow-2xl rounded-md">
        <div className="w-full h-full rounded-md pt-8 bg-white grid justify-center px-3 pb-8">
          <div className="space-y-5">
            <h1 className="text-blue-800 text-xl font-bold text-center">
              BudgetMaster
            </h1>

            <div className="text-center">
              <h1 className="font-bold">Créez votre compte</h1>
              <span className="text-gray-400 text-sm block">
                Bienvenue ! Veuillez compléter les informations
              </span>
              <span className="text-sm text-gray-400 block">
                pour commencer.
              </span>
            </div>

            <div className="space-y-4">
              <button
                onClick={Connect}
                className="border p-2 border-gray-200 w-full shadow rounded-md bg-white hover:bg-gray-100 transition"
              >
                Continuer avec Google
              </button>

              <div className="flex justify-center items-center gap-4">
                <span className="bg-gray-300 h-[1px] w-full" />
                <span className="text-sm text-gray-500">ou</span>
                <span className="bg-gray-300 h-[1px] w-full" />
              </div>
            </div>

            {/* Optionnel - champ inutilisé si connexion Google uniquement */}
            {/* 
            <div className="flex flex-col gap-2">
              <span className="font-bold">Adresse email</span>
              <input
                type="email"
                placeholder="Entrez votre adresse e-mail"
                className="px-3 outline-none focus:border p-1 focus:border-blue-300 border w-full border-gray-200 rounded-md"
              />
            </div>
            */}

            {/* Bouton "Continuer" désactivé pour le moment */}
            <div>
              <button
                className="flex p-2 justify-center items-center gap-2 text-white rounded-md bg-gray-900 w-full"
                disabled
              >
                Continuer
                <Play size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 py-4">
          <span className="text-gray-600 text-sm">
            Vous avez déjà un compte ?
          </span>
          <span className="text-blue-600 text-sm cursor-pointer hover:underline">
            Se connecter
          </span>
        </div>
      </div>
    </div>
  );
}
