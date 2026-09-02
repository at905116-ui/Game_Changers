import React from 'react';
import { AlertTriangle, RefreshCw, Cpu, Activity } from 'lucide-react';

interface HeaderProps {
  isFlushed: boolean;
  onReset: () => void;
  onOpenPythonTab: () => void;
  totalLostRevenue?: number;
  totalTrappedCarts?: number;
  urgentRestockCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  isFlushed,
  onReset,
  onOpenPythonTab,
  totalLostRevenue = 1420500,
  totalTrappedCarts = 12402,
  urgentRestockCount = 14
}) => {
  return (
    <header className="bg-white text-[#141414] border-b border-[#141414] sticky top-0 z-40">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F27D26] flex items-center justify-center font-bold text-white rounded-xs text-base font-mono shrink-0 shadow-xs">
            C
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase italic font-editorial text-[#141414] flex items-center gap-2">
              Clinkit <span className="font-normal not-italic opacity-60 text-xs sm:text-sm tracking-widest font-sans uppercase">Intent-Driven Command Center</span>
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#141414]/60">
              Outage Recovery • Intent-Aware ROP Engine • Dead Stock Liquidation
            </p>
          </div>
        </div>

        {/* Right Actions & High Density Telemetry Quick Stats */}
        <div className="flex items-center flex-wrap gap-4 sm:gap-6">
          {/* Header Quick KPIs */}
          <div className="hidden lg:flex items-center gap-6 border-l border-[#141414] pl-6 py-0.5">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase opacity-60 font-bold tracking-wider font-mono">Lost Revenue</span>
              <span className="text-base font-mono font-bold text-red-600">
                ₹{isFlushed ? '0.00' : totalLostRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex flex-col border-l border-[#141414]/30 pl-5">
              <span className="text-[9px] uppercase opacity-60 font-bold tracking-wider font-mono">Trapped Carts</span>
              <span className="text-base font-mono font-bold text-[#F27D26]">
                {isFlushed ? 0 : totalTrappedCarts.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col border-l border-[#141414]/30 pl-5">
              <span className="text-[9px] uppercase opacity-60 font-bold tracking-wider font-mono">Urgent Restocks</span>
              <span className="text-base font-mono font-bold text-[#141414]">
                {urgentRestockCount} SKUs
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPythonTab}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-black hover:bg-[#F27D26] text-white transition-colors duration-150 rounded-xs shadow-xs"
              title="View & download full Streamlit app.py and CSVs"
            >
              <Cpu className="w-3.5 h-3.5 mr-1.5 text-[#F27D26] group-hover:text-white" />
              Streamlit app.py
            </button>

            {isFlushed && (
              <button
                onClick={onReset}
                className="inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-white hover:bg-slate-100 text-[#141414] border border-[#141414] transition-colors rounded-xs shadow-xs"
                title="Reset simulation to pre-flush state"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-[#F27D26]" />
                Reset Simulation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* High-Density Incident & Active Ticker Strip */}
      <div className="bg-[#141414] text-white px-4 sm:px-6 lg:px-8 py-2 text-[11px] font-mono border-t border-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-flex items-center px-1.5 py-0.5 bg-[#F27D26] text-black text-[9px] font-bold uppercase tracking-wider rounded-xs shrink-0">
            INCIDENT REPORT
          </span>
          <span className="opacity-90">
            Late August checkout gateway fail triggered a <strong className="text-red-400">70.5% cart abandonment surge</strong>. Stock reserved on Add_to_Cart artificially created phantom stockouts.
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] opacity-70 shrink-0">
          <span className="flex items-center gap-1 text-[#F27D26]">
            <Activity className="w-3 h-3 animate-pulse" /> Live Telemetry
          </span>
          <span>Lead Time: 3 Days</span>
          <span>Z-Score: 1.65 (95% SL)</span>
        </div>
      </div>
    </header>
  );
};

