export default function ModifieProfile({ close }) {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)] z-10 grid place-items-center">
      <div className="bg-white p-4 rounded shadow-md w-100 ">
        <div className="flex justify-between">
          <strong>Modifier le profil </strong>
          <span onClick={close}>X</span>
        </div>
        <div className="border-t border-gray-200 border-b py-8 mt-4">
          <div className="grid justify-center items space-y-4">
            <span className="w-20 h-20 rounded-full grid justify-center items-center bg-blue-100 text-2xl  text-blue-600">
              MS
            </span>
            <span className="text-blue-600">Changer la photo</span>
          </div>

          <div className="space-y-3">
            <div>
              <span>Nom</span>
              <input
                type="text"
                className="outline-none focus:border focus:border-blue-900 focus:bg-white bg-gray-100 w-full py-2 px-3 rounded-md"
              />
            </div>
            <div>
              <span>Email</span>
              <input
                type="email"
                className="outline-none focus:border focus:border-blue-900 focus:bg-white bg-gray-100 w-full py-2 px-3 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={close}
            className="border border-gray-200 rounded-md grid justify-center items-center py-1 w-full "
          >
            Annuler
          </button>
          <button className="bg-blue-700 text-white rounded-md grid justify-center items-center py-1 w-full">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
