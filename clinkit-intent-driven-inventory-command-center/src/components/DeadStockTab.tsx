import React, { useState } from 'react';
import { DeadStockItem } from '../types';
import { Sparkles, DollarSign, Tag, ArrowRight, Layers, Percent } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';

interface DeadStockTabProps {
  deadStockItems: DeadStockItem[];
  scatterPlotData: Array<{
    Product_ID: string;
    Product_Name: string;
    Category: string;
    Price: number;
    Closing_Stock: number;
    Total_Add_to_Carts: number;
    Is_Dead_Stock: boolean;
    Quadrant: string;
  }>;
}

export const DeadStockTab: React.FC<DeadStockTabProps> = ({
  deadStockItems,
  scatterPlotData
}) => {
  const [selectedSKU, setSelectedSKU] = useState<string | null>(null);

  const totalDeadCapital = deadStockItems.reduce((sum, item) => sum + item.Dead_Stock_Capital, 0);
  const totalDeadUnits = deadStockItems.reduce((sum, item) => sum + item.Closing_Stock, 0);

  const maxStock = Math.max(...scatterPlotData.map((d) => d.Closing_Stock), 45) + 5;
  const maxCarts = Math.max(...scatterPlotData.map((d) => d.Total_Add_to_Carts), 30) + 5;

  return (
    <div className="space-y-5">
      {/* Top Banner & KPI */}
      <div className="bg-white p-5 border border-[#141414] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight italic font-editorial text-[#141414] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F27D26]" />
                Dead Stock Liquidator
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-red-50 text-red-700 border border-red-300 rounded-xs">
                Rule: Stock &gt; 15 &amp; Intent &lt; 10
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#141414]/80 mt-1 max-w-3xl leading-relaxed">
              Identifies slow-moving SKUs locking up critical warehouse cash. By bundling these low-intent items with high-velocity heroes, Clinkit can liquidate trapped capital to fund urgent restocks of Orange Juice and Instant Noodles.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-[#E4E3E0] border border-[#141414]/30 px-4 py-3 rounded-xs font-mono">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-[#141414]/60 block">
                Trapped Dead Capital
              </span>
              <span className="text-2xl font-bold text-red-600">
                ₹{totalDeadCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="h-8 w-px bg-[#141414]/20" />
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-[#141414]/60 block">
                Dead Stock SKUs
              </span>
              <span className="text-2xl font-bold text-[#141414]">
                {deadStockItems.length} <span className="text-xs font-normal text-[#141414]/60">({totalDeadUnits} units)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Plotly-Style Scatter Plot Visualizer */}
      <div className="bg-white p-5 border border-[#141414] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 border-b border-[#E4E3E0] pb-3">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#141414] font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F27D26]" />
              Inventory Quadrant: Closing Stock (X) vs. Total Add_to_Carts (Y)
            </h4>
            <p className="text-[11px] font-mono text-[#141414]/60">
              Red markers (Stock &gt; 15, Add_to_Carts &lt; 10) highlight high-priority liquidation candidates.
            </p>
          </div>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#E4E3E0" />
              
              {/* Threshold Guidelines & Dead Stock Zone */}
              <ReferenceLine
                x={15}
                stroke="#dc2626"
                strokeDasharray="3 3"
                label={{ value: 'High Stock Cutoff (15u)', position: 'top', fill: '#dc2626', fontSize: 10, fontFamily: 'monospace' }}
              />
              <ReferenceLine
                y={10}
                stroke="#dc2626"
                strokeDasharray="3 3"
                label={{ value: 'Low Intent Cutoff (10 carts)', position: 'right', fill: '#dc2626', fontSize: 10, fontFamily: 'monospace' }}
              />

              <XAxis
                type="number"
                dataKey="Closing_Stock"
                name="Closing Stock"
                domain={[0, maxStock]}
                tick={{ fontSize: 10, fill: '#141414', fontFamily: 'monospace' }}
                label={{ value: 'Closing Stock (Units in Warehouse)', position: 'insideBottom', offset: -15, fill: '#141414', fontSize: 11, fontFamily: 'monospace' }}
              />
              <YAxis
                type="number"
                dataKey="Total_Add_to_Carts"
                name="Total Add to Carts"
                domain={[0, maxCarts]}
                tick={{ fontSize: 10, fill: '#141414', fontFamily: 'monospace' }}
                label={{ value: 'Total Add to Carts (Intent Velocity)', angle: -90, position: 'insideLeft', offset: 0, fill: '#141414', fontSize: 11, fontFamily: 'monospace' }}
              />

              <Tooltip
                cursor={{ strokeDasharray: '2 2' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#141414] text-white p-3 text-xs shadow-2xl border border-[#F27D26] space-y-1 font-mono max-w-xs">
                        <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-1">
                          <span className="font-bold text-[#F27D26]">{data.Product_ID}</span>
                          <span className="text-[10px] bg-white/10 text-white px-1.5 py-0.5 rounded-xs">{data.Category}</span>
                        </div>
                        <p className="font-semibold font-sans text-white">{data.Product_Name}</p>
                        <div className="pt-1 space-y-0.5 text-[11px]">
                          <p>Closing Stock: <span className="font-bold text-white">{data.Closing_Stock} units</span></p>
                          <p>Add to Carts: <span className="font-bold text-[#F27D26]">{data.Total_Add_to_Carts} events</span></p>
                          <p>Unit Price: <span className="text-emerald-400">₹{data.Price.toFixed(2)}</span></p>
                          <p className="pt-1 text-[11px]">
                            Quadrant:{' '}
                            <span className={data.Is_Dead_Stock ? 'text-red-400 font-bold' : 'text-white/80'}>
                              {data.Quadrant}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Scatter name="Products" data={scatterPlotData} onClick={(entry) => setSelectedSKU(entry.Product_ID)}>
                {scatterPlotData.map((entry, index) => {
                  return (
                    <Cell
                      key={`scatter-cell-${index}`}
                      fill={entry.Is_Dead_Stock ? '#dc2626' : entry.Total_Add_to_Carts > 15 ? '#F27D26' : '#141414'}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      r={entry.Is_Dead_Stock ? 8 : 6}
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#141414]/70 pt-3 border-t border-[#E4E3E0]">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 bg-red-600 inline-block border border-[#141414]" />
            <span className="font-bold text-red-700">🎯 Dead Stock (Stock &gt; 15 &amp; Intent &lt; 10)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 bg-[#F27D26] inline-block border border-[#141414]" />
            <span>⚡ High Intent Performers</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 bg-[#141414] inline-block border border-[#141414]" />
            <span>📦 Normal Catalog SKUs</span>
          </div>
        </div>
      </div>

      {/* Dead Stock Action Plan & Bundling Recommendations */}
      <div className="bg-white border border-[#141414] shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-[#141414] bg-[#E4E3E0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="font-bold text-[#141414] text-xs sm:text-sm uppercase tracking-widest font-mono flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#F27D26]" />
              Dead Stock Liquidation Bundle Recommendations
            </h4>
            <p className="text-[10px] font-mono text-[#141414]/60">
              Cross-merchandising and promotional tactics to rapidly convert dead SKUs into liquid working capital.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#141414] text-white text-[10px] font-bold uppercase tracking-widest border-b border-[#141414]">
                <th className="py-2.5 px-3">Product ID</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-center">Closing Stock</th>
                <th className="py-2.5 px-3 text-center">Add to Carts</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right text-red-400 bg-black font-bold">
                  Trapped Capital
                </th>
                <th className="py-2.5 px-3">Recommended Bundle Strategy</th>
                <th className="py-2.5 px-3 text-center">Target Discount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E3E0]">
              {deadStockItems.map((item) => {
                const isSelected = selectedSKU === item.Product_ID;
                return (
                  <tr
                    key={item.Product_ID}
                    onClick={() => setSelectedSKU(item.Product_ID)}
                    className={`hover:bg-[#E4E3E0]/40 cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-50' : ''
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
                    <td className="py-2.5 px-3 text-center font-bold text-red-600">
                      {item.Closing_Stock}
                    </td>
                    <td className="py-2.5 px-3 text-center text-[#141414]/60">
                      {item.Total_Add_to_Carts}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#141414]">
                      ₹{item.Price.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-red-600 bg-red-50/40">
                      ₹{item.Dead_Stock_Capital.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-sans font-medium text-[#141414]">
                      <div className="flex items-center space-x-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-[#F27D26] shrink-0" />
                        <span>{item.Bundle_Recommendation}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 rounded-xs">
                        <Percent className="w-3 h-3 mr-0.5 text-amber-700" />
                        {item.Suggested_Discount}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

