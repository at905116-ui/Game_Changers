import React, { useState } from 'react';
import { PYTHON_STREAMLIT_CODE } from '../data/pythonScript';
import { Copy, Check, Download, FileCode, Database, Presentation, Terminal, ShieldAlert } from 'lucide-react';
import { Product, InventoryRecord, CustomerInteraction, Order } from '../types';
import { convertToCSV } from '../data/mockDataset';

interface PythonExportTabProps {
  products: Product[];
  inventory: InventoryRecord[];
  interactions: CustomerInteraction[];
  orders: Order[];
}

export const PythonExportTab: React.FC<PythonExportTabProps> = ({
  products,
  inventory,
  interactions,
  orders
}) => {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'python' | 'csv' | 'pitch'>('python');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PYTHON_STREAMLIT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPython = () => {
    const blob = new Blob([PYTHON_STREAMLIT_CODE], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'app.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Sub-navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-[#141414] shadow-xs">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveSubTab('python')}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors rounded-xs flex items-center gap-1.5 ${
              activeSubTab === 'python'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-[#E4E3E0] text-[#141414] hover:bg-[#141414]/10'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-[#F27D26]" />
            Streamlit app.py
          </button>

          <button
            onClick={() => setActiveSubTab('csv')}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors rounded-xs flex items-center gap-1.5 ${
              activeSubTab === 'csv'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-[#E4E3E0] text-[#141414] hover:bg-[#141414]/10'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-[#F27D26]" />
            Download Hackathon CSVs (4 Files)
          </button>

          <button
            onClick={() => setActiveSubTab('pitch')}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-colors rounded-xs flex items-center gap-1.5 ${
              activeSubTab === 'pitch'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-[#E4E3E0] text-[#141414] hover:bg-[#141414]/10'
            }`}
          >
            <Presentation className="w-3.5 h-3.5 text-[#F27D26]" />
            Executive Brief
          </button>
        </div>

        {activeSubTab === 'python' && (
          <div className="flex items-center space-x-2 font-mono">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase bg-white hover:bg-[#E4E3E0] text-[#141414] border border-[#141414] transition-colors rounded-xs shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1 text-[#141414]/70" />
                  Copy Script
                </>
              )}
            </button>

            <button
              onClick={handleDownloadPython}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase bg-[#F27D26] hover:bg-black text-white transition-colors rounded-xs shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download app.py
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Python Code Viewer */}
      {activeSubTab === 'python' && (
        <div className="bg-[#141414] border border-[#141414] shadow-xs overflow-hidden">
          <div className="px-4 py-2.5 bg-[#000000] border-b border-[#141414] flex items-center justify-between text-xs text-white/70 font-mono">
            <div className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-[#F27D26]" />
              <span className="text-white font-bold">app.py (Streamlit + Pandas + Plotly Command Center)</span>
            </div>
            <span className="text-[10px] text-white/50">
              Run locally: <code className="text-[#F27D26]">streamlit run app.py</code>
            </span>
          </div>

          <pre className="p-4 sm:p-5 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[600px] leading-relaxed select-all bg-[#0d0d0d]">
            {PYTHON_STREAMLIT_CODE}
          </pre>
        </div>
      )}

      {/* Tab 2: CSV Data Downloader */}
      {activeSubTab === 'csv' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* products.csv */}
          <div className="bg-white p-4 border border-[#141414] shadow-xs space-y-2.5 font-mono">
            <div className="flex items-center justify-between border-b border-[#E4E3E0] pb-2">
              <span className="font-bold text-xs uppercase text-[#141414]">products.csv</span>
              <span className="text-[10px] bg-[#E4E3E0] px-1.5 py-0.5 rounded-xs text-[#141414] font-bold">
                {products.length} rows
              </span>
            </div>
            <p className="text-[11px] text-[#141414]/70">
              Columns: <code className="text-[10px] text-[#F27D26] bg-[#E4E3E0] px-1 py-0.5 rounded-xs">[Product_ID, Product_Name, Category, Price]</code>
            </p>
            <button
              onClick={() => downloadCSV('products.csv', convertToCSV(products))}
              className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-bold uppercase tracking-wider bg-[#141414] hover:bg-[#F27D26] text-white transition-colors rounded-xs shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download products.csv
            </button>
          </div>

          {/* inventory.csv */}
          <div className="bg-white p-4 border border-[#141414] shadow-xs space-y-2.5 font-mono">
            <div className="flex items-center justify-between border-b border-[#E4E3E0] pb-2">
              <span className="font-bold text-xs uppercase text-[#141414]">inventory.csv</span>
              <span className="text-[10px] bg-[#E4E3E0] px-1.5 py-0.5 rounded-xs text-[#141414] font-bold">
                {inventory.length} records (31 days)
              </span>
            </div>
            <p className="text-[11px] text-[#141414]/70">
              Columns: <code className="text-[10px] text-[#F27D26] bg-[#E4E3E0] px-1 py-0.5 rounded-xs">[Date, Product_ID, Opening_Stock, Units_Sold, Replenishment_Units, Closing_Stock, Stock_Status]</code>
            </p>
            <button
              onClick={() => downloadCSV('inventory.csv', convertToCSV(inventory))}
              className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-bold uppercase tracking-wider bg-[#141414] hover:bg-[#F27D26] text-white transition-colors rounded-xs shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download inventory.csv
            </button>
          </div>

          {/* customer_interactions.csv */}
          <div className="bg-white p-4 border border-[#141414] shadow-xs space-y-2.5 font-mono">
            <div className="flex items-center justify-between border-b border-[#E4E3E0] pb-2">
              <span className="font-bold text-xs uppercase text-[#141414]">customer_interactions.csv</span>
              <span className="text-[10px] bg-[#E4E3E0] px-1.5 py-0.5 rounded-xs text-[#141414] font-bold">
                {interactions.length} events
              </span>
            </div>
            <p className="text-[11px] text-[#141414]/70">
              Columns: <code className="text-[10px] text-[#F27D26] bg-[#E4E3E0] px-1 py-0.5 rounded-xs">[Interaction_ID, Timestamp, Customer_ID, Session_ID, Product_ID, Interaction_Type]</code>
            </p>
            <button
              onClick={() => downloadCSV('customer_interactions.csv', convertToCSV(interactions))}
              className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-bold uppercase tracking-wider bg-[#141414] hover:bg-[#F27D26] text-white transition-colors rounded-xs shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download customer_interactions.csv
            </button>
          </div>

          {/* orders.csv */}
          <div className="bg-white p-4 border border-[#141414] shadow-xs space-y-2.5 font-mono">
            <div className="flex items-center justify-between border-b border-[#E4E3E0] pb-2">
              <span className="font-bold text-xs uppercase text-[#141414]">orders.csv</span>
              <span className="text-[10px] bg-[#E4E3E0] px-1.5 py-0.5 rounded-xs text-[#141414] font-bold">
                {orders.length} orders
              </span>
            </div>
            <p className="text-[11px] text-[#141414]/70">
              Columns: <code className="text-[10px] text-[#F27D26] bg-[#E4E3E0] px-1 py-0.5 rounded-xs">[Order_ID, Order_Timestamp, Customer_ID, Session_ID, Product_ID, Quantity, Unit_Price, Total_Amount]</code>
            </p>
            <button
              onClick={() => downloadCSV('orders.csv', convertToCSV(orders))}
              className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-bold uppercase tracking-wider bg-[#141414] hover:bg-[#F27D26] text-white transition-colors rounded-xs shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download orders.csv
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Hackathon Presentation Brief */}
      {activeSubTab === 'pitch' && (
        <div className="bg-white p-6 border border-[#141414] shadow-xs space-y-5 text-[#141414]">
          <div className="border-b border-[#141414] pb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F27D26] block">
              Executive Summary &amp; Hackathon Brief
            </span>
            <h3 className="text-xl font-bold tracking-tight italic font-editorial text-[#141414] mt-1">
              Resolving Clinkit&apos;s Phantom Stockout &amp; Demand Forecasting Crisis
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 border border-red-300 space-y-2 rounded-xs font-mono">
              <div className="flex items-center space-x-2 text-red-900 font-bold text-xs uppercase">
                <ShieldAlert className="w-3.5 h-3.5 text-red-700" />
                <span>1. The Outage Shock</span>
              </div>
              <p className="text-[11px] text-red-950 font-sans leading-relaxed">
                A late August checkout outage inflated cart abandonment to 70.5%. Clinkit&apos;s inventory service locked items in shopping bags without auto-releasing failed checkouts, triggering artificial stockouts on high-demand essentials.
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-300 space-y-2 rounded-xs font-mono">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase">
                <Terminal className="w-3.5 h-3.5 text-amber-700" />
                <span>2. The Flawed ROP Trap</span>
              </div>
              <p className="text-[11px] text-amber-950 font-sans leading-relaxed">
                Restocking using historical completed sales causes a death spiral: suppressed sales make ROP look low, resulting in zero reorders for Orange Juice and Ramen right when customer desire is at its peak.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-300 space-y-2 rounded-xs font-mono">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs uppercase">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>3. The Intent-Aware Fix</span>
              </div>
              <p className="text-[11px] text-emerald-950 font-sans leading-relaxed">
                By switching to <code className="bg-emerald-100 px-1 py-0.5 rounded-xs font-bold text-emerald-900">Daily Intent = Add_to_Carts / 31</code> and pairing it with a statistical safety stock (1.65 &times; &sigma; &times; &radic;3), Clinkit restores true demand signals and frees capital by liquidating dead stock SKUs (&gt;15 stock, &lt;10 intent).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

