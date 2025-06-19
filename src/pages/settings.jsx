import {
  BusFront,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Film,
  HeartPulse,
  LogOut,
  ShoppingBag,
  Trash,
  Utensils,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ModifieProfile from "../../components/ModifieProfile";
import Wrapper from "../../components/Wrapper";
import { useAuth } from "../../context/AuthContext";

const url = process.env.NEXT_PUBLIC_LOCAL;

const checked = [
  { title: "Mode sombre", message: "Changer l'apparence de l'application" },
  { title: "Notification", message: "Recevoir des alertes de budget" },
  { title: "Suggestions automatique", message: "Catégorisation intelligente" },
];
const iconMap = {
  Alimentation: (
    <Utensils className="w-10 h-10 p-2 text-sm text-orange-200 bg-orange-400 rounded-full" />
  ),
  Transport: (
    <BusFront className="w-10 h-10 p-2 rounded-full text-blue-200 bg-blue-400  " />
  ),
  Shopping: (
    <ShoppingBag className="w-10 h-10 p-2 text-green-400 bg-green-200 rounded-full" />
  ),
  Sante: (
    <HeartPulse className="w-10 h-10 p-2  text-red-500 bg-red-200 rounded-full" />
  ),
  Loisir: (
    <Film className="w-10 h-10 p-2 text-purple-500 bg-purple-200 rounded-full" />
  ),
  Facture: (
    <FileText className="w-10 h-10 p-2 rounded-full  text-green-600 bg-green-300" />
  ),
};

function Settings() {
  const router = useRouter();

  const { user, loading } = useAuth();
  const uid = user?.uid;
  const [OpenModale, setOpenModale] = useState(false);
  const [categorie, setCategorie] = useState(0);
  const [dataUser, setdataUser] = useState([]);
  const [valueOption, setValueOption] = useState("");
  const [getDev, setGetdev] = useState([]);
  const [openDialogue, setopenDialogue] = useState(false);
  const [soldeRestant, setsoldeRestant] = useState({});
  const [deleteProfil, setDeleteProfil] = useState(false);
  const [users, setUsers] = useState(null);

  // Supprimer utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/userconnect/recupeuser", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok) {
          setUsers(data?.user.user);

          console.log("ussss", data?.user.user);

          // { uid, email, ... }
        } else {
          setUsers(null);
        }
      } catch (error) {
        setUsers(null);
      }
    };

    fetchUser();
  }, []);

  async function deleteUSers() {
    if (!users) {
      return;
    }
    if (!uid) return;
    const r = await fetch(`${url}/api/deleteprofil/supprimer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid: uid }),
    });
    const data = await r.json();

    if (r.ok) {
      console.log(data.message);
    } else {
      console.log(data.message);
    }
  }

  // récupération des données des utilisateurs
  useEffect(() => {
    async function GetUID() {
      if (!uid) return;
      const r = await fetch(`${url}/api/userProfil/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });
      const data = await r.json();

      setsoldeRestant(data?.data?.newCat);

      setdataUser(data?.data);
      setCategorie(data?.data?.categorie);
    }
    GetUID();

    // récupère devise
    async function getDevise() {
      if (!uid) return;
      const r = await fetch(`${url}/api/devise/getdevise`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });
      const data = await r.json();

      setGetdev(data?.data || []);
    }
    getDevise();
  }, [uid]);

  // déconnexion

  const logout = async () => {
    const response = await fetch(`${url}/api/deconnect/logout`);
    if (response.ok) {
      alert("Vous êtes déconnecté");
      // Utiliser replace() pour éviter que l'utilisateur puisse revenir à la page protégée
      router.replace("/");
    } else {
      alert("Erreur lors de la déconnexion");
    }
  };

  // modification des valeur des différentes catégories
  const handleChangeCategorie = async (val, category) => {
    const sommecategorie = {
      ...categorie,
      [category]: val,
    };
    const somme = Object.values(sommecategorie).reduce(
      (acc, ss) => acc + ss,
      0
    );

    setCategorie(sommecategorie);
    setdataUser((prev) => ({
      ...prev,
      soldeglobal: somme,
    }));

    const r = await fetch(`${url}/api/solde/editesoldecategorie`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid,
        category,
        value: val,
      }),
    });

    const data = await r.json();
  };

  // Solde Globale
  const handleChangeSoldeGlobale = async (val) => {
    const nombreCategorie = Object.keys(categorie || {}).length;

    const ValeurParCategorie = Math.floor(val / nombreCategorie);

    const newCategorie = {};

    for (const key of Object.keys(categorie || {})) {
      newCategorie[key] = ValeurParCategorie;
    }

    setCategorie(newCategorie || {});

    setdataUser((prev) => ({
      ...prev,
      soldeglobal: Number(val),
    }));

    await fetch(`${url}/api/solde/editesoldeuncoup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid,
        value: newCategorie,
      }),
    });

    const response = await fetch(`${url}/api/solde/editesoldeglobal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid,
        value: val,
      }),
    });
    const data = await response.json();
  };

  // ajouter devise
  const Postdevis = async (val) => {
    const r = await fetch(`${url}/api/devise/devisesolde`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid, value: val }),
    });
    const data = await r.json();
    if (r.ok) {
      toast.success(data.message);
    } else {
      toast.error(data.message);
    }
  };

  // supprimer toutes les collections
  async function DeleteCollections() {
    const r = await fetch(`${url}/api/deleteCollection/deleteCol`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid,
        collections: ["depense", "depenses_annee", "devise", "notifications"],
      }),
    });
    const data = await r.json();
    if (r.ok) {
      toast.success(data.message);
      setopenDialogue(false);
    }
  }
  useEffect(() => {
    if (!soldeRestant || typeof soldeRestant !== "object") return;

    Object.entries(soldeRestant).forEach(([key, value]) => {
      if (value === 0) {
        toast.error(
          `Le solde de la catégorie ${key} est à 0, veillez alimenter le solde`
        );
      }
    });
  }, [soldeRestant]);
  if (loading)
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  if (!user) {
    alert("Veillez vous connecté avant d'acceder a la page !");
    router.push("/");
    return null;
  }

  return (
    <Wrapper>
      <main className="space-y-4">
        <section className="bg-white py-4 px-3 space-y-4 rounded-md">
          <div className="flex gap-4">
            <div className="bg-blue-200 w-20 h-20 grid items-center justify-center rounded-full">
              <span className="text-2xl text-blue-600 font-bold">MS</span>
            </div>

            <div className="flex flex-col gap-4">
              <strong>{dataUser.displayName} </strong>
              <span>{dataUser.email}</span>
            </div>
          </div>
          <div
            onClick={() => setOpenModale(true)}
            className="grid justify-center border border-gray-300 py-1 rounded-md cursor-pointer"
          >
            Modifier le profil
          </div>
        </section>

        <section className="bg-white py-4 px-3 space-y-4 rounded-md">
          <div className="mb-4">
            <strong>Budget mensuel global</strong>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Budget global</span>
              <span>
                {" "}
                {dataUser?.soldeglobal?.toLocaleString("fr-FR")}{" "}
                {getDev?.devise}
              </span>
            </div>
            <input
              value={dataUser.soldeglobal ?? 0}
              type="range"
              step={1000}
              min={0}
              max={3000000}
              className="w-full appearance-auto"
              onChange={(e) => handleChangeSoldeGlobale(Number(e.target.value))}
            />
          </div>

          {/* Les autres soldes */}

          {Object.entries(categorie || {}).map(([key, value]) => (
            <div key={key}>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>{key}</span>
                  <span>
                    {" "}
                    {value?.toLocaleString("fr-FR")} {getDev?.devise}
                  </span>
                </div>
                <input
                  value={categorie[key]}
                  type="range"
                  step={1000}
                  min={0}
                  max={500000}
                  className="w-full appearance-auto"
                  onChange={(e) => {
                    handleChangeCategorie(Number(e.target.value), key);
                  }}
                />
              </div>
            </div>
          ))}
        </section>
        {/* solde reste depenses */}
        <section className="bg-white rounded-md w-full px-3 py-4 space-y-4">
          <h1 className="font-bold">Solde restant</h1>
          <div className="grid grid-cols-2 gap-2 ">
            {Object.entries(soldeRestant || {}).map(([key, value]) => {
              return (
                <div key={key} className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    {iconMap[key]}
                    <strong className="text-sm"> {key} </strong>
                  </div>
                  <span className="bg-gray-50 py-2 px-3 rounded-md text-center shadow  ">
                    {value.toLocaleString("fr-FR")} {getDev?.devise}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Préférences */}
        <section className="bg-white px-3 py-2 rounded-md">
          <h1>Préférences</h1>
          {checked.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b border-gray-400 py-2"
            >
              <div className="flex flex-col gap-4">
                <strong>{item.title}</strong>
                <span>{item.message}</span>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          ))}
          <div className="flex justify-between items-center mt-4">
            <div className="flex flex-col gap-4">
              <h1>Devise</h1>
              <span>Changer la devise principale</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <select
                value={valueOption}
                onChange={(e) => {
                  Postdevis(e.target.value),
                    setValueOption(e.target.value),
                    setGetdev(
                      (prev) => ({ ...prev }, { devise: e.target.value })
                    );
                }}
                className="outline-none shadow bg-gray-300 rounded-md max-w-4"
              >
                <option value="">
                  {" "}
                  <ChevronDown />{" "}
                </option>
                <option value="€">EURO (€)</option>
                <option value="CFA">CFA (₣)</option>
              </select>
              <div className="font-bold">
                ({getDev.devise ?? "aucune devise selectionnée"})
              </div>
            </div>
          </div>
        </section>

        {/* Exportation */}
        <section className="bg-white px-3 py-3 rounded-md">
          <h1>Exportation des données</h1>
          <div
            onClick={() => setDeleteProfil(true)}
            className="flex justify-between bg-gray-100 py-2 px-2 rounded-md mt-2"
          >
            <div className="flex gap-2">
              <Download />
              <span>Supprimer votre compte</span>
            </div>
            <ChevronRight />
          </div>
        </section>

        {/* Actions */}
        <section className="bg-white px-3 py-3 rounded-md">
          <h1>Actions</h1>
          <div className="space-y-4 mt-2">
            <div
              onClick={() => {
                setopenDialogue(true);
              }}
              className="flex justify-between bg-gray-100 py-2 px-2 rounded-md"
            >
              <div className="flex gap-2">
                <Trash />
                <span>Réinitialiser les données</span>
              </div>
              <ChevronRight />
            </div>
            <div className="flex justify-between text-red-500 bg-red-100 py-2 px-2 rounded-md cursor-pointer">
              <div onClick={logout} className="flex gap-2">
                <Trash />
                <span>Déconnexion</span>
              </div>
              <LogOut />
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="flex flex-col justify-center items-center text-gray-400 mt-5">
          <span>BudgetMaster v2.5.0</span>
          <span>© 2025 BudgetMaster. Tous droits réservés.</span>
        </div>
      </footer>
      {/* supprimer donner */}
      {openDialogue && (
        <div className="fixed top-0 w-full h-full left-0 bottom-0 z-0 grid justify-center items-center">
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>{" "}
          {/* fond noir semi-transparent */}
          <div className="relative z-10 bg-white rounded-md w-full indent-1 px-3 py-4 grid gap-2">
            <div>Vos donnée serons supprimer</div>
            <div className="flex gap-4">
              <button
                onClick={() => DeleteCollections()}
                className="bg-red-500 text-white rounded-md px-3"
              >
                Oui
              </button>
              <button
                onClick={() => setopenDialogue(false)}
                className="bg-gray-500 rounded-md px-2"
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )}
      {/* supprimer le profil */}

      {deleteProfil && (
        <div className="fixed top-0 w-full h-full left-0 bottom-0 z-0 grid justify-center items-center">
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>{" "}
          {/* fond noir semi-transparent */}
          <div className="relative z-10 bg-white rounded-md w-full indent-1 px-3 py-4 grid gap-2">
            <div>Votre compte sera supprimer</div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  deleteUSers(), logout();
                }}
                className="bg-red-500 text-white rounded-md px-3"
              >
                Oui
              </button>
              <button
                onClick={() => setDeleteProfil(false)}
                className="bg-gray-500 rounded-md px-2"
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )}
      {OpenModale && <ModifieProfile close={() => setOpenModale(false)} />}
    </Wrapper>
  );
}

export default Settings;
