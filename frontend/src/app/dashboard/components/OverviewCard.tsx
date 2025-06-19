import { FaArrowTrendUp } from "react-icons/fa6";
import { FaCoins } from "react-icons/fa6";
import { GiCancel } from "react-icons/gi";
import TokenBalanceCard from "./TokenBalanceCard";
import ChartComponent from "./ChartComponent";
export function OverviewCard() {
  return (
    <div className="rounded-2xl flex gap-2 text-white">
      <div className="text-sm  flex-1 flex flex-col gap-3">
        <div className="text-gray-400">Total Balance</div>
        <div className="flex items-baseline">
          <span className="text-3xl">$ 32419</span>
          <span className="text-gray-400">.24</span>
          <div className="ml-3 flex items-center gap-2">
            <FaArrowTrendUp className="text-green-600" />
            <div className="text-green-600">12.1</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl p-2.5 bg-white text-black flex items-center gap-1 hover:bg-gray-100 hover:scale-103 transition-all duration-200 shadow-md hover:shadow-lg">
            <FaCoins />
            Approve
          </button>
          <button className="rounded-xl p-2.5 bg-white text-black flex items-center gap-1 hover:bg-red-50 hover:text-red-600 hover:scale-103 transition-all duration-200 shadow-md hover:shadow-lg">
            <GiCancel />
            Cancel Approval
          </button>
        </div>
        <TokenBalanceCard />
        <div className="text-gray-500 p-1">
          * These balances and amounts are only for tokens managed via this
          platform
        </div>
      </div>
      <div className="flex-1/3">
        <ChartComponent />
      </div>
    </div>
  );
}
