"use client";
import {
  BusFront,
  FileText,
  Film,
  HeartPulse,
  Plus,
  ShoppingBag,
  TriangleAlert,
  Utensils,
} from "lucide-react";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NouvelleDepense from "../../components/NouvelleDepense";
import Wrapper from "../../components/Wrapper";
import { useAuth } from "../../context/AuthContext";

const SoldeDonutChart = dynamic(
  () => import("../../components/SoldeDonutChart"),
  {
    ssr: false,
  }
);

const ReversedBarChart = dynamic(
  () => import("../../components/ReversedBarChart"),
  { ssr: false }
);

function home() {
  const url = process.env.NEXT_PUBLIC_LOCAL;
  const [OpenModal, setOpenModal] = useState(false);
  const { user, loading } = useAuth();
  const uid = user?.uid;
  const [getDev, setGetdev] = useState([]);
  const [hist, setHisto] = useState([]);
  const [Categorie, setCategorie] = useState(0);
  const [solde, setSolde] = useState(0);
  const [mois, setmois] = useState(null);

  useEffect(() => {
    if (!uid) return;
    async function getDevise() {
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

  const iconMap = {
    Alimentation: (
      <Utensils className="w-10 h-10 p-2 text-orange-200 bg-orange-400 rounded-full" />
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

  useEffect(() => {
    async function GetHist() {
      if (!uid) return;
      const r = await fetch(`${url}/api/historique/historiquecat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: uid }),
      });

      const data = await r.json();

      const moisCourant = new Date().toISOString().slice(0, 7);
      const historiqueDuMois = data?.depense.filter((item) =>
        item.id.startsWith(moisCourant)
      );

      setmois(moisCourant);

      const historique = historiqueDuMois[0]?.details;
      setHisto(historique);
    }

    GetHist();

    async function UserSolde() {
      if (!uid) return;
      const r = await fetch(`${url}/api/userProfil/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: uid }),
      });

      const data = await r.json();

      const SoldeGlobal = data?.data.soldeglobal;
      setSolde(SoldeGlobal);
      const Cat = data.data.newCat;
      setCategorie(Cat);
    }
    UserSolde();
  }, [uid]);

  const somme = hist?.reduce((acc, depense) => {
    if (!acc[depense.categorie]) {
      acc[depense.categorie] = 0;
    }
    acc[depense.categorie] += depense.montant;
    return acc;
  }, {});

  const table = Object.entries(somme ?? 0.0).map(([key, value]) => {
    return { name: key, montant: value };
  });

  const total =
    somme && typeof somme === "object"
      ? Object.values(somme).reduce((acc, val) => acc + val, 0)
      : "Chargement...";

  const Cal = (Number(total) * 100) / solde;
  const pourcentage = Cal.toFixed(1);

  const Alert = pourcentage >= 70 && (
    <div>
      Attention: Vous avez utilisé {pourcentage} % de votre <br />
      budjet mensuel .
    </div>
  );

  const aujourdhui = new Date();
  const options = { day: "numeric", month: "long", year: "numeric" };
  const dateFormatee = aujourdhui.toLocaleDateString("fr-FR", options);

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

  // close modale

  const closeM = () => {
    setOpenModal(!OpenModal);
    window.location.reload();
  };
  return (
    <div>
      <Wrapper>
        <main className=" space-y-4 z-50 ">
          <section>
            {Alert && (
              <div className="bg-yellow-50 text-orange-400 flex items-center gap-2 p-4 border-l-4 border-orange-400 rounded-lg">
                <TriangleAlert color="orange" />
                {Alert}
              </div>
            )}
          </section>
          <section>
            <div className="flex flex-col bg-white px-3 py-5 rounded-lg ">
              <div className="flex justify-between">
                <span>Budget {mois} </span>
                <span>{dateFormatee}</span>
              </div>
              <div className="mt-16 w-full grid justify-center items-center z-10 indent-10 relative">
                <SoldeDonutChart total={solde} depense={total} />
              </div>
            </div>
          </section>
          <section>
            <div className="bg-white px-3 pt-5 grid rounded-lg">
              <span>Dépense par catégorie</span>
              <div>
                <ReversedBarChart data={table} />
              </div>
            </div>
          </section>

          <section>
            <div className="bg-white  w-full py-5 px-3 rounded-lg">
              <div className="flex justify-between items-center">
                <h1>Dernières transactions</h1>{" "}
                <span onClick={() => router.push("/mois")}>Voir tout</span>
              </div>

              <div className="mt-5 overflow-hidden h-40">
                {hist?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-4 border-b border-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="  w-[40px] h-[40px] rounded-full items-center grid justify-center  ">
                        {iconMap[item.categorie]}
                      </span>
                      <div className="flex flex-col space-y-2">
                        <span> {item.description} </span>
                        <span className="text-sm text-gray-600">
                          {item.date}{" "}
                        </span>
                      </div>
                    </div>

                    <span>
                      - {item.montant.toLocaleString("fr-FR")} {getDev?.devise}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <section>
          <div
            onClick={() => {
              setOpenModal(true);
            }}
            className="fixed bottom-18 rounded-sm right-5 bg-violet-600 text-white p-4 font-bold
          "
          >
            <Plus strokeWidth={"5"} />
          </div>
        </section>

        <section>
          {OpenModal && <NouvelleDepense closeModale={() => closeM()} />}
        </section>
      </Wrapper>
    </div>
  );
}

export default home;
