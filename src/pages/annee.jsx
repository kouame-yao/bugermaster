import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Wrapper from "../../components/Wrapper";
import { useAuth } from "../../context/AuthContext";

const LineChartDepenses = dynamic(
  () => import("../../components/LineChartDepenses"),
  { ssr: false }
);

function année() {
  const { user, loading } = useAuth();
  const uid = user?.uid;
  const [anneeList, setAnneeList] = useState([]);
  const [index, setIndex] = useState(0);
  const [Mois, setMois] = useState([]);
  const [getDev, setGetdev] = useState([]);
  const router = useRouter();

  const url = process.env.NEXT_PUBLIC_LOCAL;

  useEffect(() => {
    async function getDevise() {
      if (!uid) return;
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
  }, [uid, url]);

  const moisAbbr = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  useEffect(() => {
    async function GetHisAnne() {
      if (!uid) return;
      const r = await fetch(`${url}/api/historique/annee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await r.json();
      setAnneeList(data?.table);
    }

    async function GetHisMois() {
      if (!uid) return;
      const r = await fetch(`${url}/api/historique/mois`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await r.json();
      setMois(data?.table);
    }

    GetHisAnne();
    GetHisMois();
  }, [uid, url]);

  // ⛔ Correction hydration error
  const anneeActuelle = anneeList[index];
  const anneePrecedente = anneeList.find(
    (a) => parseInt(a.id) === parseInt(anneeActuelle?.id) - 1
  );

  const ChangeAnnee = (direction) => {
    if (direction === "prev" && index > 0) setIndex(index - 1);
    else if (direction === "next" && index < anneeList.length - 1)
      setIndex(index + 1);
  };

  const dataGraph = Mois.map((item) => {
    const [annee, mois] = item.id.split("-");
    const moisTexte = moisAbbr[parseInt(mois) - 1];
    return { mois: moisTexte, [`y${annee}`]: item.total };
  });

  const calAnuel =
    (anneeActuelle?.total_annuel * 100) /
    (anneeActuelle?.totaldepenseAnnuel || 1);
  const resultAn = calAnuel.toFixed(2);

  const comparePourcentage = (actuel = 0, precedent = 0) => {
    if (!precedent || precedent === 0) return "N/A";
    const diff = ((actuel - precedent) / precedent) * 100;
    return `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`;
  };

  const trimestreStats = ["Q1", "Q2", "Q3", "Q4"].map((q) => {
    const actuel = anneeActuelle?.[`trimestres.${q}`] || 0;
    const precedent = anneePrecedente?.[`trimestres.${q}`] || 0;
    return {
      label: q,
      actuel,
      precedent,
      variation: comparePourcentage(actuel, precedent),
    };
  });

  const totalVariation = comparePourcentage(
    anneeActuelle?.total_annuel || 0,
    anneePrecedente?.total_annuel || 0
  );

  const topCategories = (() => {
    if (!anneeActuelle?.details) return [];
    const map = {};
    anneeActuelle.details.forEach(({ categorie, montant }) => {
      if (!map[categorie]) map[categorie] = 0;
      map[categorie] += montant;
    });
    const total = Object.values(map).reduce((acc, val) => acc + val, 0);
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([categorie, montant]) => ({
        categorie,
        montant,
        pourcentage: ((montant / total) * 100).toFixed(1),
      }));
  })();

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
        <section className="bg-white px-3 py-4 w-full rounded-md space-y-4">
          <div className="flex justify-between items-center">
            <span>Année {anneeActuelle?.id}</span>
            <div className="flex gap-2">
              <ChevronLeft
                onClick={() => ChangeAnnee("prev")}
                className="p-1 w-6 h-6 bg-gray-100 shadow rounded-md"
              />
              <ChevronRight
                onClick={() => ChangeAnnee("next")}
                className="p-1 w-6 h-6 bg-gray-100 shadow rounded-md"
              />
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Dépenses totales</span>
            <span>Dépenses annuelles</span>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="font-bold">
              {anneeActuelle?.total_annuel.toLocaleString("fr-FR")}{" "}
              {getDev?.devise}
            </h1>
            <h1 className="font-bold">
              {anneeActuelle?.totaldepenseAnnuel.toLocaleString("fr-FR")}{" "}
              {getDev?.devise}
            </h1>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1 text-green-400 font-semibold">
              <ArrowDown size={15} />
              <span>{totalVariation.toLocaleString("fr-FR")}</span>
              <span>vs {parseInt(anneeActuelle?.id) - 1}</span>
            </div>
            <div className="text-gray-500">{resultAn}% utilisé</div>
          </div>
        </section>

        <section className="bg-white px-3 py-4 w-full rounded-md space-y-4">
          <h1 className="font-bold">Evolution des dépenses</h1>
          <LineChartDepenses data={dataGraph} />
        </section>

        <section className="bg-white px-3 py-4 w-full rounded-md">
          <h1 className="font-bold mb-2">Résumé par trimestre</h1>
          <div className="flex flex-col space-y-4">
            {trimestreStats.map((t) => (
              <div
                key={t.label}
                className="grid gap-2 bg-gray-100 shadow py-2 px-3 rounded-md"
              >
                <div className="flex justify-between items-center">
                  <strong>
                    {t.label} {anneeActuelle?.id}
                  </strong>
                  <strong>
                    {t.actuel.toLocaleString("fr-FR")} {getDev?.devise}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    {t.label === "Q1" && "Jan - Mar"}
                    {t.label === "Q2" && "Apr - Jun"}
                    {t.label === "Q3" && "Jul - Sep"}
                    {t.label === "Q4" && "Oct - Dec"}
                  </span>
                  {t.precedent > 0 ? (
                    <span
                      className={`flex items-center gap-1 ${
                        t.actuel >= t.precedent
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {t.actuel >= t.precedent ? (
                        <ArrowUp size={15} />
                      ) : (
                        <ArrowDown size={15} />
                      )}
                      {t.variation} vs {parseInt(anneeActuelle?.id) - 1}
                    </span>
                  ) : (
                    <span className="text-gray-400">A venir</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white py-4 px-3 w-full h-full rounded-md">
          <h1 className="font-bold mb-4">Top catégories</h1>
          <div className="space-y-4">
            {topCategories.length === 0 ? (
              <p className="text-gray-500">Aucune dépense trouvée.</p>
            ) : (
              topCategories.map(({ categorie, montant, pourcentage }, i) => (
                <div className="flex justify-between items-center" key={i}>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center text-gray-600 font-bold">
                      {categorie[0]}
                    </div>
                    <span>{categorie}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span>
                      {montant.toLocaleString("fr-FR")} {getDev?.devise}
                    </span>
                    <span className="text-sm text-gray-500">
                      {pourcentage}% du total
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </Wrapper>
  );
}

export default année;
