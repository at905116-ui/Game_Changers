import React from 'react';
import { IndianRupee, ShoppingCart, AlertOctagon, TrendingUp, Unlock } from 'lucide-react';

interface MetricCardsProps {
  totalLostRevenue: number;
  totalTrappedCarts: number;
  urgentRestockCount: number;
  avgIntentUplift: number;
  isFlushed: boolean;
  totalLockedUnits: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalLostRevenue,
  totalTrappedCarts,
  urgentRestockCount,
  avgIntentUplift,
  isFlushed,
  totalLockedUnits
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Total Lost Revenue */}
      <div className="bg-white p-4 sm:p-5 border border-[#141414] shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#E4E3E0] pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-[#F27D26]">01</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/70">
              Total Lost Revenue
            </span>
          </div>
          <div className="w-6 h-6 bg-red-50 border border-red-200 flex items-center justify-center text-red-600 rounded-xs">
            <IndianRupee className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="my-3">
          <div className="text-2xl sm:text-3xl font-mono font-bold text-red-600 tracking-tight">
            ₹{isFlushed ? '0.00' : totalLostRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-[11px] font-mono">
            {isFlushed ? (
              <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 border border-emerald-200 rounded-xs">
                <Unlock className="w-3 h-3 mr-1" />
                Stock Restored to Available
              </span>
            ) : (
              <span className="inline-flex items-center text-red-700 font-bold bg-red-50 px-1.5 py-0.5 border border-red-200 rounded-xs">
                <span className="w-1.5 h-1.5 bg-red-600 mr-1.5 animate-ping"></span>
                70.5% Cart Abandonment Outage
              </span>
            )}
          </div>
        </div>

        <p className="text-[10px] font-mono text-[#141414]/50 border-t border-[#E4E3E0] pt-2">
          Unfulfilled Add_to_Cart revenue in late Aug.
        </p>
      </div>

      {/* KPI 2: Total Trapped Carts */}
      <div className="bg-white p-4 sm:p-5 border border-[#141414] shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#E4E3E0] pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-[#F27D26]">02</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/70">
              Trapped Carts
            </span>
          </div>
          <div className="w-6 h-6 bg-[#F27D26]/10 border border-[#F27D26]/30 flex items-center justify-center text-[#F27D26] rounded-xs">
            <ShoppingCart className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="my-3">
          <div className="text-2xl sm:text-3xl font-mono font-bold text-[#F27D26] tracking-tight">
            {isFlushed ? 0 : totalTrappedCarts.toLocaleString()}{' '}
            <span className="text-xs font-mono font-normal text-[#141414]/60">SESSIONS</span>
          </div>
          <div className="mt-1 flex items-center text-[11px] font-mono">
            {isFlushed ? (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 border border-emerald-200 rounded-xs">
                All expired sessions cleared
              </span>
            ) : (
              <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 border border-amber-200 rounded-xs">
                🔒 {totalLockedUnits} units locked in phantom hold
              </span>
            )}
          </div>
        </div>

        <p className="text-[10px] font-mono text-[#141414]/50 border-t border-[#E4E3E0] pt-2">
          Distinct user sessions with Add_to_Cart &amp; no order.
        </p>
      </div>

      {/* KPI 3: Urgent Restock Items */}
      <div className="bg-white p-4 sm:p-5 border border-[#141414] shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#E4E3E0] pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-[#F27D26]">03</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/70">
              Urgent Restocks
            </span>
          </div>
          <div className="w-6 h-6 bg-red-50 border border-red-200 flex items-center justify-center text-red-600 rounded-xs">
            <AlertOctagon className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="my-3">
          <div className="text-2xl sm:text-3xl font-mono font-bold text-[#141414] tracking-tight flex items-baseline gap-1.5">
            <span className="text-red-600">{urgentRestockCount}</span>
            <span className="text-xs font-mono font-normal text-[#141414]/60">ITEMS CRITICAL</span>
          </div>
          <div className="mt-1 flex items-center text-[11px] font-mono text-red-700 font-bold bg-red-50 px-1.5 py-0.5 border border-red-200 rounded-xs w-fit">
            Closing Stock &le; Intent-Aware ROP
          </div>
        </div>

        <p className="text-[10px] font-mono text-[#141414]/50 border-t border-[#E4E3E0] pt-2">
          Facing immediate stockout on top-of-funnel desire.
        </p>
      </div>

      {/* KPI 4: Avg Intent ROP Uplift */}
      <div className="bg-white p-4 sm:p-5 border border-[#141414] shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#E4E3E0] pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-[#F27D26]">04</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/70">
              Avg. Intent ROP Uplift
            </span>
          </div>
          <div className="w-6 h-6 bg-slate-100 border border-slate-300 flex items-center justify-center text-[#141414] rounded-xs">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="my-3">
          <div className="text-2xl sm:text-3xl font-mono font-bold text-[#141414] tracking-tight flex items-baseline gap-1.5">
            <span className="text-[#F27D26]">+{avgIntentUplift}</span>
            <span className="text-xs font-mono font-normal text-[#141414]/60">UNITS/SKU</span>
          </div>
          <div className="mt-1 flex items-center text-[11px] font-mono text-[#141414] font-bold bg-[#E4E3E0] px-1.5 py-0.5 border border-[#141414]/20 rounded-xs w-fit">
            Corrects suppressed outage sales
          </div>
        </div>

        <p className="text-[10px] font-mono text-[#141414]/50 border-t border-[#E4E3E0] pt-2">
          Extra safety buffer recommended vs sales-only ROP.
        </p>
      </div>
    </div>
  );
};

