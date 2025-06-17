import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Play } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import auth from "../../lib/firabase";
export default function Sign_up() {
  const { user, loadinng } = useAuth();
  const router = useRouter();
  async function Connect() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const user = result.user;
    const uid = user.uid;
    const email = user.email;
    const displayName = user.displayName;

    const r = await fetch("/api/userconnect/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: uid,
        email: email,
        displayName: displayName,
      }),
    });
    const data = await r.json();

    if (r.ok) {
      router.push("/home");
    } else {
      toast.error(data);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen w-full">
      <div className=" bg-gray-100 w-full m-3 h-full  shadow-2xl rounded-md ">
        <div className="w-full h-full rounded-md pt-8 bg-white grid justify-center px-3 pb-8 ">
          <div className="space-y-5">
            <h1 className="text-blue-800 grid justify-center ">BudgetMaster</h1>
            <div className="">
              <h1 className="font-bold grid justify-center">
                Créez votre compte
              </h1>
              <span className=" w-full text-gray-300 text-sm grid justify-center items-center">
                Bienvenue ! Veuillez compléter les informations
              </span>
              <span className="text-sm text-gray-300 grid justify-center">
                {" "}
                pour commancer.
              </span>
            </div>
            <div>
              <div
                onClick={() => Connect()}
                className="border p-1 border-gray-200  grid justify-center shadow rounded-md cursor-pointer"
              >
                <span>Coninuer avec Google</span>
              </div>
              <div className="flex justify-center items-center gap-4">
                <span className="bg-gray-300 h-[1px] w-full border-0  "></span>
                <span>ou</span>
                <span className="bg-gray-300 h-[1px] w-full border-0  "></span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-bold">Adresse email</span>
              <input
                type="email"
                placeholder="Entrez votre adresse e-mail"
                className="px-3 outline-none focus:border p-1 focus:border-blue-300 border w-full border-gray-200 rounded-md"
              />
            </div>
            <div className="">
              <button className=" flex p-1 justify-center   items-center gap-2 text-gray-200 rounded-md bg-gray-900 w-full">
                Continuer
                <Play size={"14"} />
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-2 py-4">
          <span className="text-gray-600 text-sm">
            Vous avez déjà un compte ?{" "}
          </span>
          <span className="text-sm">Se connecter</span>
        </div>
      </div>
    </div>
  );
}
