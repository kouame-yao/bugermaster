import {
  ArrowLeft,
  BusFront,
  Dot,
  FileText,
  Film,
  HeartPlus,
  Search,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const url = process.env.NEXT_PUBLIC_LOCAL;

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
    <HeartPlus className="w-10 h-10 p-2  text-red-500 bg-red-200 rounded-full" />
  ),
  Loisir: (
    <Film className="w-10 h-10 p-2 text-purple-500 bg-purple-200 rounded-full" />
  ),
  Facture: (
    <FileText className="w-10 h-10 p-2 rounded-full  text-green-600 bg-green-300" />
  ),
};

export default function RechercheTransaction({ close }) {
  const { user, loading } = useAuth();
  const uid = user?.uid;
  const [isactive, setIsactive] = useState("");
  const [historique, setHistorique] = useState([]);
  const [valueInput, setValueInput] = useState("");
  const [getDev, setGetdev] = useState([]);
  const day = [
    { name: "Tout" },
    { name: "7 jours" },
    { name: "30 jours" },
    { name: "12 mois" },
  ];

  useEffect(() => {
    async function getDevise() {
      if (!uid) {
        return;
      }
      const r = await fetch(`${url}/api/devise/getdevise`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: uid }),
      });
      const data = await r.json();

      setGetdev(data?.data || {});
    }
    getDevise();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    async function GetHist() {
      const r = await fetch(`${url}/api/historique/historiquecat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });

      const data = await r.json();

      const details = Array.isArray(data?.depense)
        ? data.depense[0]?.details
        : [];
      setHistorique(details || []);
    }

    GetHist();
  }, [uid]);

  const normalize = (str) =>
    str
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const filtrerParDate = (item) => {
    const maintenant = new Date();
    const dateItem = new Date(item.date);

    if (!item.date || isNaN(dateItem)) return false;
    if (!isactive || isactive === "Tout") return true;

    if (isactive === "7 jours") {
      const ilYA7Jours = new Date();
      ilYA7Jours.setDate(maintenant.getDate() - 7);
      return dateItem >= ilYA7Jours;
    }

    if (isactive === "30 jours") {
      const ilYA30Jours = new Date();
      ilYA30Jours.setDate(maintenant.getDate() - 30);
      return dateItem >= ilYA30Jours;
    }

    if (isactive === "12 mois") {
      const ilYA12Mois = new Date();
      ilYA12Mois.setMonth(maintenant.getMonth() - 12);
      return dateItem >= ilYA12Mois;
    }

    return false;
  };

  const resultatsFiltres = historique
    .filter((item) => {
      const correspondTexte =
        normalize(valueInput) !== "" &&
        (normalize(item.categorie)?.includes(normalize(valueInput)) ||
          normalize(item.description)?.includes(normalize(valueInput)) ||
          item.montant?.toString().includes(valueInput));
      return correspondTexte || isactive === "Tout";
    })
    .filter(filtrerParDate);

  const afficherResultats = normalize(valueInput) !== "" || isactive === "Tout";

  return (
    <div>
      <section className="px-3 border-b border-gray-100 py-4 grid gap-4">
        <div className="flex gap-4 items-center w-full">
          <span onClick={close}>
            <ArrowLeft />
          </span>
          <input
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            type="search"
            className="outline-none shadow focus:border focus:border-blue-500 w-full p-2 rounded-2xl bg-gray-100"
            placeholder="Rechercher une transaction..."
          />
        </div>

        <div className="flex items-center gap-3">
          {day.map((item, index) => (
            <button
              onClick={() => setIsactive(item.name)}
              key={index}
              className={`${
                isactive === item.name
                  ? "bg-blue-400 text-white shadow"
                  : "bg-gray-100"
              } rounded-md px-3 py-1`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </section>

      <section className="w-full h-150 overflow-auto">
        {afficherResultats ? (
          resultatsFiltres.length > 0 ? (
            resultatsFiltres.reverse().map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b border-gray-400 py-1 px-3"
              >
                <div className="flex gap-4 items-center">
                  {iconMap[item.categorie]}
                  <div className="grid space-y-4">
                    <strong>{item.description}</strong>
                    <div className="flex text-sm text-gray-400">
                      <span>{item.date}</span>
                      <Dot />
                      <span>{item.categorie}</span>
                    </div>
                  </div>
                </div>
                <div className="flex font-bold gap-1">
                  <span>- {item.montant}</span>
                  <span>{getDev?.devise}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="px-3 py-6 text-gray-500 text-center">
              Aucun résultat trouvé
            </p>
          )
        ) : (
          <section className="mt-20">
            <div className="flex flex-col items-center justify-center px-3">
              <span className="grid w-10 h-10 items-center justify-center rounded-full bg-gray-100">
                <Search size={"20"} color="gray" />
              </span>
              <span className="text-center mt-2 text-gray-600 text-sm">
                Recherchez des transactions par description, montant ou
                catégorie
              </span>
            </div>
          </section>
        )}
      </section>
    </div>
  );
}
