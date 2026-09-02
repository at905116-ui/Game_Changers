import React, { useState } from 'react';
import { IntentRestockAnalysis } from '../types';
import { FileSpreadsheet, Search, Filter, AlertTriangle, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface RestockCenterTabProps {
  restockAnalysis: IntentRestockAnalysis[];
  onGeneratePO: () => void;
}

export const RestockCenterTab: React.FC<RestockCenterTabProps> = ({
  restockAnalysis,
  onGeneratePO
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyUrgent, setOnlyUrgent] = useState<boolean>(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(false);

  const categories = ['All', ...Array.from(new Set(restockAnalysis.map((item) => item.Category)))];

  const filteredItems = restockAnalysis.filter((item) => {
    const matchesSearch =
      item.Product_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Product_ID.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.Category === selectedCategory;
    const matchesUrgent = onlyUrgent ? item.Is_Urgent : true;
    return matchesSearch && matchesCat && matchesUrgent;
  });

  const urgentCount = restockAnalysis.filter((i) => i.Is_Urgent).length;

  // Comparison chart data for top items
  const chartData = restockAnalysis
    .slice(0, 8)
    .map((item) => ({
      name: item.Product_ID,
      productName: item.Product_Name,
      closingStock: item.Closing_Stock,
      intentROP: item.Intent_Aware_ROP,
      traditionalROP: item.Traditional_ROP
    }));

  return (
    <div className="space-y-5">
      {/* Top Logic & Action Card */}
      <div className="bg-white p-5 border border-[#141414] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight italic font-editorial text-[#141414]">
                Intent-Driven Restock Center
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-[#E4E3E0] text-[#141414] border border-[#141414]/30 rounded-xs">
                Formula Mandate
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#141414]/80 mt-1 max-w-3xl leading-relaxed">
              Traditional inventory models calculate Reorder Points from past sales—which collapsed during the payment outage.
              The <strong>Intent-Aware ROP</strong> models true consumer desire from <code className="text-[#F27D26] font-mono text-xs bg-[#F27D26]/10 px-1 py-0.5 font-bold border border-[#F27D26]/30">Add_to_Cart</code> events to prevent catastrophic stockouts.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              className="inline-flex items-center px-3 py-2 text-xs font-bold uppercase tracking-wider bg-white hover:bg-[#E4E3E0] text-[#141414] border border-[#141414] transition-colors rounded-xs shadow-xs"
            >
              <Info className="w-3.5 h-3.5 mr-1.5 text-[#141414]/70" />
              {showFormulaDetails ? 'Hide Math' : 'View Formula Math'}
            </button>

            <button
              onClick={onGeneratePO}
              className="inline-flex items-center px-4 py-2 bg-black hover:bg-[#F27D26] text-white text-xs font-bold uppercase tracking-widest transition-colors rounded-xs shadow-xs active:scale-98"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
              Generate Priority Purchase Orders
            </button>
          </div>
        </div>

        {/* Formula breakdown visual */}
        {showFormulaDetails && (
          <div className="mt-4 p-4 bg-[#141414] text-white font-mono text-xs space-y-3 border border-[#141414]">
            <div className="font-bold text-[#F27D26] text-xs uppercase tracking-widest border-b border-white/20 pb-1 flex items-center justify-between">
              <span>Mathematical Logic Breakdown:</span>
              <span className="text-[10px] text-white/50">Service Level Z = 1.65 (95%)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white/5 p-3 border border-white/10 rounded-xs">
                <span className="text-white/50 block text-[10px] uppercase font-bold tracking-wider">Step 1: Daily Intent</span>
                <span className="text-amber-300 font-bold text-xs mt-0.5 block">
                  Daily_Intent = Total_Add_to_Carts / 31
                </span>
                <p className="text-[10px] text-white/60 font-sans mt-1">
                  Normalizes monthly top-of-funnel customer interest into daily velocity.
                </p>
              </div>

              <div className="bg-white/5 p-3 border border-white/10 rounded-xs">
                <span className="text-white/50 block text-[10px] uppercase font-bold tracking-wider">Step 2: Safety Stock</span>
                <span className="text-sky-300 font-bold text-xs mt-0.5 block">
                  SS = 1.65 &times; &sigma;<sub>sales</sub> &times; &radic;3
                </span>
                <p className="text-[10px] text-white/60 font-sans mt-1">
                  1.65 (95% service level) &times; StdDev of daily sales &times; &radic;(3 days lead time).
                </p>
              </div>

              <div className="bg-white/5 p-3 border border-white/10 rounded-xs">
                <span className="text-white/50 block text-[10px] uppercase font-bold tracking-wider">Step 3: Intent-Aware ROP</span>
                <span className="text-emerald-300 font-bold text-xs mt-0.5 block">
                  ROP = (Daily_Intent &times; 3) + SS
                </span>
                <p className="text-[10px] text-white/60 font-sans mt-1">
                  Lead time demand derived from intent plus statistical safety buffer.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Visualizer: Closing Stock vs Intent ROP vs Traditional ROP */}
      <div className="bg-white p-5 border border-[#141414] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 border-b border-[#E4E3E0] pb-3">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#141414] flex items-center gap-2 font-mono">
              <TrendingUp className="w-4 h-4 text-[#F27D26]" />
              Closing Stock vs. Intent-Aware ROP vs. Traditional ROP
            </h4>
            <p className="text-[11px] font-mono text-[#141414]/60">
              Traditional ROP severely under-estimates reorder thresholds during outage suppression.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-red-50 text-red-700 border border-red-300 rounded-xs uppercase tracking-wider">
            {urgentCount} SKUs Below Intent ROP
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E4E3E0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#141414', fontFamily: 'monospace' }} />
              <YAxis tick={{ fontSize: 10, fill: '#141414', fontFamily: 'monospace' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#141414] text-white p-3 text-xs shadow-2xl border border-[#F27D26] font-mono">
                        <p className="font-bold text-[#F27D26] mb-1">{data.name}: {data.productName}</p>
                        <p className="text-white/80">Closing Stock: <span className="font-bold text-white">{data.closingStock}</span></p>
                        <p className="text-emerald-400">Intent-Aware ROP: <span className="font-bold">{data.intentROP}</span></p>
                        <p className="text-white/50">Traditional Sales ROP: <span>{data.traditionalROP}</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '6px' }} />
              <Bar dataKey="closingStock" name="Current Closing Stock" fill="#141414" radius={[0, 0, 0, 0]} />
              <Bar dataKey="intentROP" name="Intent-Aware ROP (Proposed)" fill="#F27D26" radius={[0, 0, 0, 0]} />
              <Bar dataKey="traditionalROP" name="Traditional Sales ROP" fill="#A8A29E" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main High-Density Intent-Driven Matrix Table */}
      <div className="bg-white border border-[#141414] shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-[#141414] bg-[#E4E3E0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="font-bold text-[#141414] text-xs sm:text-sm uppercase tracking-widest font-mono">
              Inventory vs. Intent-Aware Reorder Matrix
            </h4>
            <p className="text-[10px] font-mono text-[#141414]/60">
              Flagged rows indicate closing stock &le; Intent-Aware ROP threshold.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#141414]/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search SKU..."
                className="pl-8 pr-2.5 py-1 text-xs rounded-xs border border-[#141414] focus:outline-none focus:ring-1 focus:ring-[#F27D26] bg-white font-mono"
              />
            </div>

            <div className="flex items-center space-x-1">
              <Filter className="w-3 h-3 text-[#141414]/60" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs py-1 px-2 rounded-xs border border-[#141414] focus:outline-none focus:ring-1 focus:ring-[#F27D26] bg-white text-[#141414] font-mono"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <label className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-300 px-2 py-1 rounded-xs cursor-pointer hover:bg-red-100 transition">
              <input
                type="checkbox"
                checked={onlyUrgent}
                onChange={(e) => setOnlyUrgent(e.target.checked)}
                className="mr-1.5 rounded-none text-red-600 focus:ring-0"
              />
              Show Only 🚨 Urgent
            </label>
          </div>
        </div>

        {/* High-Density Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#141414] text-white text-[10px] font-bold uppercase tracking-widest border-b border-[#141414]">
                <th className="py-2.5 px-3">Product ID</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-center">Closing Stock</th>
                <th className="py-2.5 px-3 text-center text-[#F27D26] bg-[#141414] font-bold">
                  Intent-ROP
                </th>
                <th className="py-2.5 px-3 text-center text-white/60">Trad. ROP</th>
                <th className="py-2.5 px-3 text-center">Daily Intent</th>
                <th className="py-2.5 px-3 text-center">Safety Stock</th>
                <th className="py-2.5 px-3 text-center">Deficit</th>
                <th className="py-2.5 px-3 text-center">Action / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E3E0]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[#141414]/40 text-xs font-mono">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  return (
                    <tr
                      key={item.Product_ID}
                      className={`hover:bg-[#E4E3E0]/40 transition-colors ${
                        item.Is_Urgent ? 'bg-red-50 font-medium' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-[#141414]">
                        {item.Product_ID}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-[#141414]">
                        {item.Product_Name}
                      </td>
                      <td className="py-2.5 px-3 text-[#141414]/70">
                        <span className="text-[10px] uppercase tracking-wider bg-[#E4E3E0] px-1.5 py-0.5 border border-[#141414]/10 rounded-xs">
                          {item.Category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#141414]">
                        {item.Closing_Stock}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#F27D26] bg-[#F27D26]/5">
                        {item.Intent_Aware_ROP.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-[#141414]/50">
                        {item.Traditional_ROP.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-[#141414]/80">
                        {item.Daily_Intent.toFixed(2)}/d
                      </td>
                      <td className="py-2.5 px-3 text-center text-[#141414]/70">
                        {item.Safety_Stock.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        <span
                          className={
                            item.Stock_Delta < 0
                              ? 'text-red-600'
                              : item.Stock_Delta <= 3
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }
                        >
                          {item.Stock_Delta > 0 ? `+${item.Stock_Delta.toFixed(2)}` : item.Stock_Delta.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.Is_Urgent ? (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-600 text-white rounded-xs">
                            <AlertTriangle className="w-3 h-3 mr-1 text-white" />
                            🚨 URGENT RESTOCK
                          </span>
                        ) : item.Stock_Delta <= 3 ? (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 rounded-xs">
                            ⚠️ WATCHLIST
                          </span>
                        ) : item.Restock_Status === '📦 OVERSTOCKED' ? (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800 rounded-xs">
                            📦 OVERSTOCKED
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-700" />
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

