import { CiSearch } from "react-icons/ci";
import { TbBellFilled } from "react-icons/tb";
export default function NavBarTop({ OpenSeach, OpenNotif }) {
  return (
    <div className=" flex justify-between items-center">
      {" "}
      <div>
        <h1 className="font-bold text-violet-900">BudgetMaster</h1>
      </div>{" "}
      <div className="flex gap-2 ">
        <div
          onClick={OpenSeach}
          className="grid bg-gray-100  w-[30px] h-[30px] rounded-sm items-center justify-center   "
        >
          <CiSearch size={"20px"} />
        </div>
        <div onClick={OpenNotif}>
          <TbBellFilled className="grid bg-gray-100  w-[30px] h-[30px] rounded-sm items-center justify-center  text- " />
        </div>
      </div>
    </div>
  );
}
