import React, { useState } from 'react';
import { LockedInventoryItem } from '../types';
import { Unlock, Search, CheckCircle2, Lock, Filter, ExternalLink, BarChart3, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface PhantomStockTabProps {
  lockedInventory: LockedInventoryItem[];
  isFlushed: boolean;
  onFlushCarts: () => void;
  onOpenSessionModal: () => void;
}

export const PhantomStockTab: React.FC<PhantomStockTabProps> = ({
  lockedInventory,
  isFlushed,
  onFlushCarts,
  onOpenSessionModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(lockedInventory.map(item => item.Category)))];

  const filteredItems = lockedInventory.filter(item => {
    const matchesSearch =
      item.Product_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Product_ID.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.Category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Category aggregation for chart
  const categoryMap = new Map<string, { category: string; lockedValue: number; lockedUnits: number }>();
  lockedInventory.forEach((item) => {
    const existing = categoryMap.get(item.Category) || { category: item.Category, lockedValue: 0, lockedUnits: 0 };
    existing.lockedValue += item.Locked_Value;
    existing.lockedUnits += item.Locked_Units;
    categoryMap.set(item.Category, existing);
  });
  const categoryChartData = Array.from(categoryMap.values()).sort((a, b) => b.lockedValue - a.lockedValue);

  const totalLockedUnits = lockedInventory.reduce((sum, i) => sum + i.Locked_Units, 0);
  const totalLockedValue = lockedInventory.reduce((sum, i) => sum + i.Locked_Value, 0);

  return (
    <div className="space-y-5">
      {/* Top Banner / Explainer */}
      <div className="bg-white p-5 border border-[#141414] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight italic font-editorial text-[#141414] flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#F27D26]" />
                Phantom Stock Unlocker
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-[#E4E3E0] text-[#141414] border border-[#141414]/30 rounded-xs">
                Outage Protocol
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#141414]/80 mt-1 max-w-3xl leading-relaxed">
              When the payment gateway failed, customers attempted checkout but encountered error timeouts.
              Because inventory reservation was triggered upon <code className="font-mono text-[#F27D26] bg-[#F27D26]/10 px-1 py-0.5 border border-[#F27D26]/30 font-bold">Add_to_Cart</code> without an expiration rollback, warehouse systems artificially marked items as &quot;Critical&quot; or &quot;Out of Stock&quot;.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenSessionModal}
              className="inline-flex items-center px-3 py-2 text-xs font-bold uppercase tracking-wider bg-white hover:bg-[#E4E3E0] text-[#141414] border border-[#141414] transition-colors rounded-xs shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-[#141414]/70" />
              Inspect Trapped Sessions
            </button>

            <button
              onClick={onFlushCarts}
              disabled={isFlushed}
              className={`inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors rounded-xs shadow-xs ${
                isFlushed
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-400 cursor-default'
                  : 'bg-[#F27D26] hover:bg-black text-white active:scale-98'
              }`}
            >
              {isFlushed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
                  Carts Flushed &amp; Stock Released
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 mr-1.5" />
                  Flush Expired Carts &amp; Release Stock
                </>
              )}
            </button>
          </div>
        </div>

        {isFlushed ? (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono flex items-center space-x-2 rounded-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>SUCCESS:</strong> All 150+ trapped outage cart reservations have been purged. Available inventory updated and released back to active sales channels.
            </span>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono flex items-center space-x-2 rounded-xs">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>CURRENT HOLD:</strong> {totalLockedUnits} units totaling <strong className="font-mono font-bold">₹{totalLockedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> are currently inaccessible to buyers due to unexpired session locks.
            </span>
          </div>
        )}
      </div>

      {/* Category Locked Capital Chart */}
      {!isFlushed && categoryChartData.length > 0 && (
        <div className="bg-white p-5 border border-[#141414] shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E4E3E0] pb-2 mb-3">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-[#141414] font-mono flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[#F27D26]" />
                Locked Capital Distribution by Category (₹ INR)
              </h4>
              <p className="text-[10px] font-mono text-[#141414]/60">
                Shows where the largest financial impact of trapped stock is concentrated.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-1 bg-[#E4E3E0] text-[#141414] border border-[#141414]/20 rounded-xs">
              Total: ₹{totalLockedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 15, left: 5, bottom: 20 }}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E4E3E0" />
                <XAxis dataKey="category" angle={-15} textAnchor="end" tick={{ fontSize: 10, fill: '#141414', fontFamily: 'monospace' }} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#141414', fontFamily: 'monospace' }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  formatter={(value: number | undefined) => [value ? `₹${value.toFixed(2)}` : '₹0.00', 'Locked Value']}
                  contentStyle={{ backgroundColor: '#141414', color: '#fff', border: '1px solid #F27D26', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="lockedValue" radius={[0, 0, 0, 0]}>
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#F27D26' : index === 1 ? '#141414' : '#78716C'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main Locked Inventory Dataframe Table */}
      <div className="bg-white border border-[#141414] shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-[#141414] bg-[#E4E3E0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="font-bold text-[#141414] text-xs sm:text-sm uppercase tracking-widest font-mono">
              Locked Inventory per Product (Phantom Stock Manifest)
            </h4>
            <p className="text-[10px] font-mono text-[#141414]/60">
              Comparing closing inventory against phantom stock locks per SKU.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#141414]/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search SKU or name..."
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
          </div>
        </div>

        {/* High Density Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#141414] text-white text-[10px] font-bold uppercase tracking-widest border-b border-[#141414]">
                <th className="py-2.5 px-3">Product ID</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-center text-[#F27D26]">Locked Units</th>
                <th className="py-2.5 px-3 text-right">Locked Value</th>
                <th className="py-2.5 px-3 text-center">Closing Stock</th>
                <th className="py-2.5 px-3 text-center">Stock Status</th>
                <th className="py-2.5 px-3 text-center text-emerald-400 bg-white/10 font-bold">
                  Available Post-Unlock
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E3E0]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#141414]/40 text-xs font-mono">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isHighImpact = item.Locked_Units >= 10;
                  return (
                    <tr
                      key={item.Product_ID}
                      className={`hover:bg-[#E4E3E0]/40 transition-colors ${
                        isHighImpact && !isFlushed ? 'bg-amber-50/70' : ''
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
                      <td className="py-2.5 px-3 text-right font-bold text-[#141414]">
                        ₹{item.Price.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#F27D26]">
                        {isFlushed ? 0 : item.Locked_Units}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-red-600">
                        ₹{isFlushed ? '0.00' : item.Locked_Value.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-[#141414]">
                        {item.Current_Closing_Stock}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-xs ${
                            item.Stock_Status === 'Critical' || item.Stock_Status === 'Out of Stock'
                              ? 'bg-red-100 text-red-900 border border-red-300'
                              : item.Stock_Status === 'Low Stock'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {item.Stock_Status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700 bg-emerald-50/40">
                        {isFlushed ? item.Current_Closing_Stock : item.Available_After_Unlock}
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
