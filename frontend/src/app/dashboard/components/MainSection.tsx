import { IoLogoBitcoin } from "react-icons/io5";
import { TbArrowZigZag } from "react-icons/tb";
import { FaEthereum } from "react-icons/fa";
import { LiaDollarSignSolid } from "react-icons/lia";
import Image from "next/image";
import { OverviewCard } from "./OverviewCard";
import ActivityTable from "./DashboardActivityComponent";
import Wallet from "../../components/Wallet";

export function MainSection() {
  return (
    <div className=" w-full rounded-2xl p-6 flex flex-col gap-4 overflow-y-scroll">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 text-xs text-gray-400">
          <div className="flex gap-1 items-center">
            <IoLogoBitcoin size={15} fill="orange" />
            <div>BTC</div>
            <div>119,121</div>
            <LiaDollarSignSolid />
            <TbArrowZigZag stroke="green" />
          </div>
          <div className="flex gap-1 items-center">
            <FaEthereum size={15} />
            <div>ETH</div>
            <div>119,121</div>
            <LiaDollarSignSolid />
            <TbArrowZigZag
              stroke="red"
              style={{ transform: "rotate(180deg)" }}
            />
          </div>
          <div className="flex gap-1 items-center">
            <Image
              src="/hyperliquid.svg"
              width={15}
              height={15}
              alt="Hyperliquid"
              className="[&>path]:fill-gray-400"
            />
            <div>HYPE</div>
            <div>119,121</div>
            <LiaDollarSignSolid />
            <TbArrowZigZag
              stroke="red"
              style={{ transform: "rotate(180deg)" }}
            />
          </div>
        </div>
        <div>
          <Wallet className="border border-pink-500 text-pink-500 rounded-xl p-2 text-sm" />
        </div>
      </div>
      <OverviewCard />
      <ActivityTable />
    </div>
  );
}
