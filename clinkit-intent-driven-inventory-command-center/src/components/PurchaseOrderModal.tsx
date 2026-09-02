import React, { useState } from 'react';
import { PurchaseOrderItem } from '../types';
import { X, Download, CheckCircle2, Truck, FileSpreadsheet, Building2 } from 'lucide-react';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrders: PurchaseOrderItem[];
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  purchaseOrders
}) => {
  const [orders, setOrders] = useState<PurchaseOrderItem[]>(purchaseOrders);
  const [exported, setExported] = useState(false);

  if (!isOpen) return null;

  const handleQtyChange = (productId: string, newQty: number) => {
    setOrders((prev) =>
      prev.map((item) => {
        if (item.Product_ID === productId) {
          const qty = Math.max(0, newQty);
          return {
            ...item,
            Order_Qty: qty,
            Total_Cost: Number((qty * item.Unit_Cost).toFixed(2))
          };
        }
        return item;
      })
    );
  };

  const totalCost = orders.reduce((sum, item) => sum + item.Total_Cost, 0);
  const totalUnits = orders.reduce((sum, item) => sum + item.Order_Qty, 0);

  const handleExportCSV = () => {
    const headers = [
      'Product_ID',
      'Product_Name',
      'Category',
      'Priority',
      'Current_Stock',
      'Intent_ROP',
      'Order_Qty',
      'Unit_Cost',
      'Total_Cost',
      'Supplier',
      'Lead_Time_Days'
    ];
    const rows = orders.map((o) => [
      o.Product_ID,
      `"${o.Product_Name}"`,
      o.Category,
      o.Priority,
      o.Current_Stock,
      o.Intent_ROP,
      o.Order_Qty,
      o.Unit_Cost,
      o.Total_Cost,
      `"${o.Supplier}"`,
      o.Lead_Time_Days
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Clinkit_Purchase_Orders_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/75 backdrop-blur-xs">
      <div className="bg-white border border-[#141414] max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#141414] bg-[#E4E3E0] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#141414] text-[#F27D26] flex items-center justify-center rounded-xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight italic font-editorial text-[#141414] flex items-center gap-2">
                Automated Priority Purchase Orders
              </h3>
              <p className="text-[10px] font-mono text-[#141414]/60">
                Calculated to replenish SKUs below Intent-Aware Reorder Points.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 hover:bg-[#141414] hover:text-white flex items-center justify-center text-[#141414] border border-[#141414] transition-colors rounded-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PO Highlights summary bar */}
        <div className="px-5 py-3 bg-[#E4E3E0]/50 border-b border-[#141414] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-[10px] text-[#141414]/60 uppercase block">Total SKUs in PO:</span>
              <strong className="text-[#141414] font-bold text-sm">{orders.length} items</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#141414]/60 uppercase block">Total Reorder Volume:</span>
              <strong className="text-[#141414] font-bold text-sm">{totalUnits} units</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#141414]/60 uppercase block">Estimated Wholesale Cost:</span>
              <strong className="text-red-600 font-bold text-sm">
                ₹{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#F27D26] hover:bg-black text-white transition-colors rounded-xs shadow-xs"
            >
              {exported ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-white" />
                  Downloaded PO CSV
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Export PO (CSV)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table of Orders */}
        <div className="flex-1 overflow-y-auto p-5">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#141414] text-white uppercase text-[10px] font-bold tracking-widest border-b border-[#141414]">
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">SKU &amp; Item Name</th>
                <th className="py-2.5 px-3">Supplier</th>
                <th className="py-2.5 px-3 text-center">Closing Stock</th>
                <th className="py-2.5 px-3 text-center text-[#F27D26]">Intent ROP</th>
                <th className="py-2.5 px-3 text-center">Reorder Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Cost</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E3E0]">
              {orders.map((item) => (
                <tr key={item.Product_ID} className="hover:bg-[#E4E3E0]/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-xs ${
                        item.Priority === 'CRITICAL'
                          ? 'bg-red-100 text-red-900 border border-red-300'
                          : item.Priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-[#E4E3E0] text-[#141414] border border-[#141414]/20'
                      }`}
                    >
                      {item.Priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-sans font-semibold text-[#141414]">{item.Product_Name}</div>
                    <span className="font-mono text-[10px] text-[#141414]/50">{item.Product_ID}</span>
                  </td>
                  <td className="py-2.5 px-3 text-[#141414]/70">
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-3 h-3 text-[#141414]/40" />
                      <span>{item.Supplier}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[10px] text-[#141414]/50">
                      <Truck className="w-2.5 h-2.5" />
                      <span>{item.Lead_Time_Days}d lead time</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#141414]">
                    {item.Current_Stock}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#F27D26]">
                    {item.Intent_ROP}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="number"
                      min={0}
                      value={item.Order_Qty}
                      onChange={(e) => handleQtyChange(item.Product_ID, parseInt(e.target.value) || 0)}
                      className="w-16 text-center font-mono font-bold text-xs py-1 px-1.5 border border-[#141414] rounded-xs focus:outline-none focus:ring-1 focus:ring-[#F27D26] bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#141414]">
                    ₹{item.Unit_Cost.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-red-600">
                    ₹{item.Total_Cost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#E4E3E0] border-t border-[#141414] flex items-center justify-between font-mono">
          <p className="text-[10px] text-[#141414]/60">
            * Wholesale estimates assume 50-60% of retail price according to category standard.
          </p>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-bold uppercase bg-white hover:bg-[#141414] hover:text-white text-[#141414] border border-[#141414] transition-colors rounded-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

