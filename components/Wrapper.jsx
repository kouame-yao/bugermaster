import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ToastContainer } from "react-toastify";
import NavBarBottom from "./NavBarBottom";
import NavBarTop from "./NavBarTop";
import Notification from "./Notification";
import RechercheTransaction from "./RechercheTransaction";

function Wrapper({ children }) {
  const [Openseach, setOpenseach] = useState(false);
  const [OpenNotif, setOpenNotif] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const divRef = useRef();

  // Fermer la notif si on clique en dehors
  useEffect(() => {
    function handleCheckOutside(event) {
      if (divRef.current && !divRef.current.contains(event.target)) {
        setOpenNotif(false);
      }
    }

    document.addEventListener("mousedown", handleCheckOutside);

    return () => {
      document.removeEventListener("mousedown", handleCheckOutside); // ✅ correction ici
    };
  }, []);

  // Activation côté client
  useEffect(() => {
    setIsClient(true);

    if (Openseach) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [Openseach]);

  return (
    <div>
      {/* notification taost */}

      <ToastContainer />
      {/* Modale recherche */}
      {isClient &&
        Openseach &&
        createPortal(
          <div className="fixed top-0 bg-white w-screen h-screen z-10">
            <RechercheTransaction close={() => setOpenseach(false)} />
          </div>,
          document.body
        )}

      {/* Modale notification */}
      {isClient &&
        OpenNotif &&
        createPortal(
          <div
            ref={divRef}
            className="fixed top-[15px] left-[150px] sm:top-[15px] sm:left-[50px] shadow-md rounded-md bg-white md:w-75 md:h-90 z-10"
          >
            <Notification />
          </div>,
          document.body
        )}

      {/* Barre du haut */}
      <div
        className={`bg-white py-5 ${
          Openseach ? "hidden" : "block"
        } fixed top-0 w-full h-16 z-50 px-4 border-b-2 border-gray-300`}
      >
        <NavBarTop
          OpenSeach={() => setOpenseach(true)}
          OpenNotif={() => setOpenNotif(true)}
        />
      </div>

      {/* Contenu principal */}
      <div className="my-20 px-4 max-md:w-full">{children}</div>

      {/* Barre du bas */}
      <div className="bg-white border-t border-gray-300 fixed bottom-0 left-0 w-full z-20">
        <NavBarBottom />
      </div>
    </div>
  );
}

export default Wrapper;
