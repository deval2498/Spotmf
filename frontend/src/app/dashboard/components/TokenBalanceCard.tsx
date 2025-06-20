import { RiArrowDropDownLine } from "react-icons/ri";

export default function TokenBalanceCard() {
  return (
    <div className="bg-gradient-to-br from-slate-600/28 to-slate-700/28 backdrop-blur-sm rounded-2xl p-3 mt-3 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-slate-200 font-semibold">Token Balance</h3>
        <button className="flex items-center gap-3 bg-slate-800/10 hover:bg-slate-700/50 border border-slate-600/30 px-3 py-1.5 rounded-xl transition-all duration-200 group">
          <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">₿</span>
          </div>
          <span className="text-slate-200 text-sm font-medium">Bitcoin</span>
          <RiArrowDropDownLine
            className="text-slate-400 group-hover:text-slate-300 transition-colors"
            size={16}
          />
        </button>
      </div>

      {/* Balance Information */}
      <div className="space-y-2">
        {/* Total Balance */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-xs">Total Balance</span>
          <span className="text-white font-bold text-lg">$12,984.24</span>
        </div>

        {/* Invested Amount */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-xs">Total Invested</span>
          <span className="text-slate-300 text-sm">$11,422.00</span>
        </div>

        {/* P&L Section */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
          <span className="text-slate-400 text-xs">Profit & Loss</span>
          <div className="flex items-center gap-1">
            <div className="text-right">
              <span className="text-emerald-400 font-semibold text-sm">
                +$1,562.24
              </span>
              <span className="text-emerald-500 text-xs ml-1">(+13.67%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
