import {
  BusFront,
  ChevronLeft,
  ChevronRight,
  Dot,
  FileText,
  Film,
  HeartPulse,
  Search,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ProgressBar from "../../components/ProgressBar";
import Wrapper from "../../components/Wrapper";
import { useAuth } from "../../context/AuthContext";

const url = process.env.NEXT_PUBLIC_LOCAL;

const PieChartDepenses = dynamic(
  () => import("../../components/PieChartDepenses"),
  { ssr: false }
);

function mois() {
  const { user, loading } = useAuth();
  const uid = user?.uid;
  const [valueRecher, setValueRecher] = useState("");
  const [hist, setHisto] = useState([]);
  const [Categorie, setCategorie] = useState(0);
  const [solde, setSolde] = useState(0);
  const [soldeTransaction, setSoldeTransaction] = useState(0);
  const [listeMois, setListeMois] = useState([]);
  const [moisActuel, setMoisActuel] = useState("");
  const [getDev, setGetdev] = useState([]);

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

      setGetdev(data?.data || []);
    }
    getDevise();
  }, [uid]);

  const couleurD = {
    Alimentation: "#4CAF50",
    Transport: "#2196F3",
    Sante: "#FF9800",
    Shooping: "#E963",
    Facture: "#FF0",
    Loisir: "#21F3",
  };

  const iconMap = {
    Alimentation: (
      <Utensils className="w-10 h-10 p-2 text-orange-200 bg-orange-400 rounded-full" />
    ),
    Transport: (
      <BusFront className="w-10 h-10 p-2 rounded-full text-blue-200 bg-blue-400" />
    ),
    Shopping: (
      <ShoppingBag className="w-10 h-10 p-2 text-green-400 bg-green-200 rounded-full" />
    ),
    Sante: (
      <HeartPulse className="w-10 h-10 p-2 text-red-500 bg-red-200 rounded-full" />
    ),
    Loisir: (
      <Film className="w-10 h-10 p-2 text-purple-500 bg-purple-200 rounded-full" />
    ),
    Facture: (
      <FileText className="w-10 h-10 p-2 rounded-full text-green-600 bg-green-300" />
    ),
  };

  useEffect(() => {
    async function GetHist() {
      if (!uid) {
        return;
      }
      const r = await fetch(`${url}/api/historique/historiquecat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      const data = await r.json();
      const moisDispo = data.depense.map((item) => item.id).sort();
      setListeMois(moisDispo);

      const moisCourant = new Date().toISOString().slice(0, 7);
      const selectedMois = moisDispo.includes(moisCourant)
        ? moisCourant
        : moisDispo[0];
      setMoisActuel(selectedMois);

      const historiqueDuMois = data.depense.find(
        (item) => item.id === selectedMois
      );
      setHisto(historiqueDuMois?.details || []);
    }

    GetHist();

    async function UserSolde() {
      if (!uid) return;
      const r = await fetch(`${url}/api/userProfil/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      const data = await r.json();
      setSolde(data?.data?.soldeglobal);
      setCategorie(data?.data?.newCat);
    }

    UserSolde();
  }, [uid]);

  useEffect(() => {
    async function refreshHist() {
      if (!uid) {
        return;
      }
      const r = await fetch(`${url}/api/historique/historiquecat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      const data = await r.json();

      const historiqueDuMois = data?.depense.find(
        (item) => item.id === moisActuel
      );
      setHisto(historiqueDuMois?.details || []);

      setSoldeTransaction(historiqueDuMois?.solde || 0);
    }

    if (moisActuel) {
      refreshHist();
    }
  }, [moisActuel, uid]);

  const handleChangeMois = (direction) => {
    const index = listeMois.indexOf(moisActuel);
    if (direction === "next" && index < listeMois.length - 1) {
      setMoisActuel(listeMois[index + 1]);
    }
    if (direction === "prev" && index > 0) {
      setMoisActuel(listeMois[index - 1]);
    }
  };

  const somme = hist.reduce((acc, depense) => {
    acc[depense.categorie] = (acc[depense.categorie] || 0) + depense.montant;
    return acc;
  }, {});

  const table = Object.entries(somme).map(([key, value]) => ({
    nom: key,
    valeur: value,
    couleur: couleurD[key],
  }));

  const total = Object.values(somme).reduce((acc, val) => acc + val, 0);
  const Cal = (Number(total) * 100) / soldeTransaction;
  const pourcentage = Cal.toFixed(1);
  const nbJoursMois = new Date().getDate();
  const totalQuotidienne = (total / nbJoursMois).toFixed(2);

  const jourEleve = Object.entries(somme).reduce(
    (max, [categorie, montant]) =>
      montant > max.montant ? { categorie, montant } : max,
    { categorie: null, montant: 0 }
  );

  const compteur = {};
  hist.forEach((depense) => {
    compteur[depense.categorie] = (compteur[depense.categorie] || 0) + 1;
  });

  const categorieTop = Object.entries(compteur).reduce(
    (max, [cat, count]) => (count > max.count ? { cat, count } : max),
    { cat: null, count: 0 }
  );

  const router = useRouter();
  if (loading)
    return (
      <div class="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
        <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
        <section className="bg-white rounded-md w-full space-y-4 py-4 px-3">
          <div className="flex justify-between items-center mt-4">
            <span>
              {new Date(moisActuel).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
              })}
            </span>
            <div className="flex space-x-2 items-center">
              <ChevronLeft
                onClick={() => handleChangeMois("prev")}
                size={30}
                className="py-1 bg-gray-100 shadow rounded-md cursor-pointer"
              />
              <ChevronRight
                onClick={() => handleChangeMois("next")}
                size={30}
                className="py-1 bg-gray-100 shadow rounded-md cursor-pointer"
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span>Dépenses totales</span>
            <span>Budget</span>
          </div>
          <div className="flex justify-between">
            <strong>
              {total.toLocaleString("fr-FR")} {getDev?.devise}
            </strong>
            <strong>
              {soldeTransaction.toLocaleString("fr-FR")} {getDev?.devise}
            </strong>
          </div>
          <div className="mb-6">
            <ProgressBar depense={total} total={soldeTransaction} />
          </div>
        </section>

        <section className="bg-white w-full h-full rounded-md px-3">
          <h1 className="font-bold">Réprésentation des dépenses</h1>
          <PieChartDepenses data={table} />
        </section>

        <section className="bg-white w-full h-full rounded-md px-3 py-4 space-y-4">
          <h1 className="font-bold">Statiques</h1>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 shadow flex flex-col gap-2 py-2 pb-6 px-3 rounded-md">
              <span className="text-sm text-gray-500">Moyenne quotidienne</span>
              <strong>
                {totalQuotidienne.toLocaleString("fr-FR")}
                {getDev?.devise}
              </strong>
            </div>
            <div className="bg-gray-100 shadow flex flex-col gap-2 py-2 pb-6 px-3 rounded-md">
              <span className="text-sm text-gray-500">Jour le plus élevé</span>
              <strong>
                {jourEleve.montant.toLocaleString("fr-FR")} {getDev?.devise}
              </strong>
            </div>
            <div className="bg-gray-100 shadow flex flex-col gap-2 py-2 pb-6 px-3 rounded-md">
              <span className="text-sm text-gray-500">
                Catégorie principale
              </span>
              <strong>{categorieTop.cat}</strong>
            </div>
            <div className="bg-gray-100 shadow flex flex-col gap-2 py-2 pb-6 px-3 rounded-md">
              <span className="text-sm text-gray-500">Transaction</span>
              <strong>{categorieTop.count}</strong>
            </div>
          </div>
        </section>

        <section className="bg-white px-3 w-full h-full p-4 rounded-md">
          <div className="flex justify-between py-3 border-b border-gray-700">
            <h1 className="font-bold">Transactions</h1>
            <div className="relative">
              <span className="absolute left-3 top-1 z-10">
                <Search size={16} color="gray" />
              </span>
              <input
                value={valueRecher}
                onChange={(e) => setValueRecher(e.target.value)}
                placeholder="Recherche..."
                type="text"
                className="rounded-2xl px-8 bg-gray-100 max-w-50 outline-none focus:border focus:border-blue-700 pl-10"
              />
            </div>
          </div>
          <div className="w-full overflow-auto h-60">
            {hist
              .filter((item) =>
                item.categorie.toLowerCase().includes(valueRecher.toLowerCase())
              )
              .reverse()
              .map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-4 border-b border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    {iconMap[item.categorie]}
                    <div className="flex flex-col gap-4">
                      <strong>{item.description}</strong>
                      <span className="text-sm text-gray-400 flex ">
                        {item.date} <Dot /> {item.categorie}
                      </span>
                    </div>
                  </div>
                  <strong>
                    -{item.montant.toLocaleString("fr-FR")}
                    {getDev?.devise}
                  </strong>
                </div>
              ))}
          </div>
        </section>
      </main>
    </Wrapper>
  );
}

export default mois;
