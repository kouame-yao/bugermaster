import { AlertCircleIcon, AlertTriangleIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Wrapper from "../../components/Wrapper";
import { useAuth } from "../../context/AuthContext";

const button = [
  { name: "Tous", value: "" },
  { name: "Alerte", value: "alerte" },
  { name: "Atatistique", value: "statistique" },
];

const url = process.env.NEXT_PUBLIC_LOCAL; // <-- ta variable d'env

function Alerts() {
  const { user, loading } = useAuth();
  const uid = user?.uid;
  const [Element, setElement] = useState("");
  const [Alertes, setAlertes] = useState([]);
  const [activeId, setActiveId] = useState(null); // notification active

  useEffect(() => {
    fetchAlertes();
  }, [uid]);

  async function fetchAlertes() {
    if (!uid) {
      return;
    }
    const r = await fetch(`${url}/api/alertes/alerteurgent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid }),
    });
    const data = await r.json();
    setAlertes(data.table || []);
  }

  async function markAllAsRead() {
    if (!uid) {
      return;
    }
    try {
      const response = await fetch(`${url}/api/alertes/vue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      if (!response.ok) {
        const text = await response.text();
        console.error("Erreur lors de marquer comme lu:", text);
      }
      fetchAlertes();
    } catch (err) {
      console.error("Erreur réseau :", err);
    }
  }

  async function deleteNotification(id) {
    if (!uid) {
      return;
    }
    try {
      const response = await fetch(`${url}/api/alertes/deletedAlerte`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, id }),
      });
      if (!response.ok) {
        const text = await response.text();
        console.error("Erreur suppression notification:", text);
      }

      const succes = await response.json();

      setAlertes((prev) => prev.filter((notif) => notif.id !== id));
      setActiveId((currentActiveId) =>
        currentActiveId === id ? null : currentActiveId
      );
    } catch (error) {
      console.error("Erreur réseau suppression :", error);
    }
  }

  const router = useRouter();

  function handleDelete(id) {
    alert(`Supprimer la notification`);
    deleteNotification(id);
  }

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
      <main className="flex flex-col gap-4">
        <section className="bg-white flex flex-col gap-4 px-3 py-4 rounded-md ">
          <div className="flex justify-between">
            <span>Notification</span>
            <button
              onClick={markAllAsRead}
              className="text-blue-600 underline hover:text-blue-800"
            >
              Tout marquer comme lu
            </button>
          </div>

          <div className="flex gap-3">
            {button.map((item, index) => (
              <div
                onClick={() => setElement(item.value)}
                key={index}
                className={`${
                  Element === item.value ? "bg-blue-600 shadow" : "bg-gray-100"
                } py-1 px-2 rounded-sm grid justify-center cursor-pointer`}
              >
                {item.name}
              </div>
            ))}
          </div>

          <div className={`${Element === "Conseils" && "hidden"}`}>
            <div className="flex flex-col gap-3">
              {Alertes?.filter((item) =>
                item.type.toLowerCase().includes(Element.toLowerCase())
              )
                .reverse()
                .map((item) => {
                  const vue =
                    item.read === false ? "bg-blue-100" : "bg-gray-100";
                  const icone =
                    item.type === "statistique" ? (
                      <AlertTriangleIcon className="bg-orange-500 rounded-full text-orange-100" />
                    ) : item.type === "alerte" ? (
                      <AlertCircleIcon className="bg-red-500 rounded-full text-red-100" />
                    ) : item.type === "rappel" ? (
                      <AlertCircleIcon className="bg-blue-500 rounded-full text-blue-100" />
                    ) : (
                      0
                    );

                  const isActive = activeId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`relative cursor-pointer flex py-2 gap-2 px-3 rounded-sm ${vue}`}
                      onClick={() => setActiveId(isActive ? null : item.id)}
                      style={{ userSelect: "none" }}
                    >
                      {icone}
                      <div className="flex flex-col gap-4">
                        <strong>{item.title} </strong>
                        <span>{item.message}</span>
                        <span>{item.createdAt}</span>
                      </div>

                      {/* Div Supprimer en position absolute à droite */}
                      {isActive && (
                        <div
                          className="absolute right-0 top-0 bottom-0 flex items-center px-2 bg-red-500 rounded-md shadow text-white rounded-l cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation(); // empêche la propagation du clic vers la notification
                            handleDelete(item.id);
                          }}
                          style={{ width: 90 }}
                        >
                          Supprimer
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </section>

        <section className="bg-white px-3 py-4 rounded-md flex flex-col gap-4">
          <div>Conseils d'économie</div>
          {/* <div className="flex flex-col bg-blue-100 rounded-md px-3 py-2">
            <strong className="text-blue-600">
              Reduissez vos dépenses alimentaires{" "}
            </strong>
            <span className="text-blue-400 ">
              Vos dépenses en alimentations sont 15% plus élévées que la
              moyenne. Essayez de planifier vos repas à l'avance pour
              économiser.
            </span>
          </div>
          <div className="flex flex-col bg-green-100 rounded-sm px-3 py-2 ">
            <strong className="text-green-600">Félicitations!</strong>
            <span className="text-green-600">
              Vous avez reduit vos dépendenses de transport de 12% ce mois-ci
              par rapport au mois dernier.
            </span>
          </div> */}

          <div className="bg-green-200 text-green-600 text-center">
            Sera bientot disponible
          </div>
        </section>
      </main>
    </Wrapper>
  );
}

export default Alerts;
