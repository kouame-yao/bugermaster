import {
  BusFront,
  FileText,
  Film,
  HeartPulse,
  ShoppingBag,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SyncLoader } from "react-spinners";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function NouvelleDepense({ closeModale }) {
  const { user, loading } = useAuth();
  const uid = user?.uid;
  const [isActive, setIsactive] = useState(false);
  const [dataUser, setdataUser] = useState([]);
  const [categorie, setCategorie] = useState(0);
  const [spiner, setspiner] = useState(false);

  const [value, setValue] = useState({
    montant: "",
    date: "",
    description: "",
  });

  const [valueCategorie, setValueCategorie] = useState("");

  // URL API de base depuis la variable d'environnement
  const url = process.env.NEXT_PUBLIC_LOCAL;

  // initialisation des champs

  const handleChange = (e) => {
    const { value, name } = e.target;

    setValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmite = async () => {
    setspiner(true);
    if (!uid) return;
    const body = {
      uid: uid,
      categorie: valueCategorie,
      value: Number(value.montant),
      description: value.description,
      date: value.date,
    };
    try {
      const r = await fetch(`${url}/api/transaction/soustraction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (r.ok) {
        setValue({
          montant: "",
          date: "",
          description: "",
        });
        setspiner(false);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
      console.error(error);
    }
  };

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
    async function GetUID() {
      if (!uid) return;
      try {
        const r = await fetch(`${url}/api/userProfil/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uid }),
        });
        const data = await r.json();

        setdataUser(data?.data);
        setCategorie(data?.data?.newCat);
      } catch (error) {
        console.error(error);
      }
    }
    GetUID();
  }, [uid, url]);

  return (
    <div className="bg-white w-screen h-screen top-0 left-0 fixed z-100 shadow-sm inset-0 ">
      <div className="flex px-3 justify-between items-center py-4 border-b border-gray-200 ">
        <span onClick={closeModale}>
          <X />
        </span>
        <span>Nouvelle dépense</span>
        <span
          onClick={handleSubmite}
          className="cursor-pointer bg-violet-300 px-3 rounded-md hover:bg-violet-100 shadow p-1 text-violet-600"
        >
          Enregistrer
        </span>
      </div>

      <main className="p-3 space-y-4">
        <section>
          <span>Montant</span>
          <input
            placeholder="Veillez entrer un montant à dépensé..."
            name="montant"
            value={value.montant}
            onChange={handleChange}
            type="number"
            className="bg-gray-100 placeholder:text-green-300  shadow rounded-md py-4 px-4 text-left  focus:bg-white focus:border-2 border-blue-200 max-w-md w-full outline-none "
          />
        </section>

        <section>
          <span>Catégorie</span>

          <div className="grid grid-cols-3 gap-4 ">
            {Object.entries(categorie).map(([item, index], key) => (
              <div
                key={key}
                onClick={() => {
                  setIsactive(item);
                  setValueCategorie(item);
                }}
                className={` ${
                  isActive === item
                    ? "bg-blue-100 border shadow border-blue-300"
                    : "bg-gray-50 shadow"
                }  flex flex-col items-center py-2 rounded-md `}
              >
                <span
                  className={`w-[40px] h-[40px] grid items-center justify-center rounded-full ${item.colorBg} ${item.colorText}  text-md  `}
                >
                  {iconMap[item]}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <span>Date</span>

          <div>
            <div>
              <span></span>
              <input
                placeholder="ajoutez une date"
                name="date"
                value={value.date}
                onChange={handleChange}
                type="date"
                className=" bg-gray-100 shadow py-3 w-full px-3 rounded-md outline-none focus:bg-white focus:border focus:border-blue-100 "
              />
            </div>
          </div>
        </section>
        <section>
          <span>Description</span>
          <div>
            <input
              name="description"
              value={value.description}
              onChange={handleChange}
              type="text"
              placeholder="Ex: Courses Carrefour"
              className="outline-none shadow py-3 px-3 rounded-md focus:border focus:border-blue-100 focus:bg-white bg-gray-100 w-full"
            />
          </div>
        </section>

        {/* <section>
          <div className="flex gap-2 bg-blue-100 text-blue-700 px-3 py-4 rounded-md">
            <span>
              <AlertCircle />
            </span>

            <div className="grid items-center  gap-4">
              <span>Suggestion</span>
              <span>
                Cette dépendense ressemble à "Courses Carefour" ( Alimentation
                ). <br />
                Voulez-vous utiliser cette catégorie?
              </span>
              <span className="bg-blue-800 text-white rounded-sm p-1 w-25 px-4">
                Appliquer
              </span>
            </div>
          </div>
        </section> */}

        {spiner && (
          <div className="fixed inset-0 z-50 bg-black opacity-50  w-full grid justify-center items-center">
            <div>
              <SyncLoader color="blue" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
