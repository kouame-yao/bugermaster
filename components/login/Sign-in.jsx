export default function Sign_in({ lien, google }) {
  return (
    <div className=" bg-gray-100 w-full m-3 h-full  shadow-2xl rounded-md ">
      <div className="w-full h-full rounded-md  pt-8 bg-white grid justify-center px-3 pb-8 ">
        <div className="space-y-5">
          <h1 className="text-blue-800 grid justify-center ">BudgetMaster</h1>
          <div className="">
            <h1 className="font-bold grid justify-center">
              Connectez-vous à BudgetMaster
            </h1>
            <span className="text-gray-300 text-sm">
              Bienvenue ! Veuillez vous connecter pour continuer.
            </span>
          </div>
          <div>
            <div
              onClick={google}
              className="border p-1 border-gray-200  grid justify-center shadow rounded-md"
            >
              <span>Coninuer avec Google</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-2 py-4">
        <span className="text-gray-600 text-sm">
          Vous n'avez pas de compte ?{" "}
        </span>
        <span className="text-sm" onClick={lien}>
          S'inscrire
        </span>
      </div>
    </div>
  );
}
