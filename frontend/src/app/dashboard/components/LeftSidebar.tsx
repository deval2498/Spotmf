import { HiMiniHome } from "react-icons/hi2";
import { GrTransaction } from "react-icons/gr";
import { GiTwoCoins } from "react-icons/gi";
export function LeftSidebar() {
  return (
    <div className="min-w-70 max-w-70 bg-gradient-to-br from-slate-600/30 via-slate-500/20 to-slate-700/40 backdrop-blur-sm rounded-2xl overflow-scroll min-h-full">
      <div className="flex flex-col py-6 px-8 gap-2">
        <div className="font-bold">
          <span className="font-matangi text-white">Wig</span>
          <span className="font-matangi text-pink-500">wag</span>
        </div>
        <div className="flex flex-col text-sm font-sans mt-10 gap-2 text-gray-400">
          <div className="p-2 hover:bg-gray-700 rounded-xl flex items-center gap-4">
            <HiMiniHome />
            <div>Dashboard</div>
          </div>
          <div className="p-2 hover:bg-gray-700 rounded-xl flex items-center gap-4">
            <GrTransaction />
            <div>Transactions</div>
          </div>
          <div className="p-2 hover:bg-gray-700 rounded-xl flex items-center gap-4">
            <GiTwoCoins />
            <div>Balances and Funds</div>
          </div>
        </div>
      </div>
    </div>
  );
}
