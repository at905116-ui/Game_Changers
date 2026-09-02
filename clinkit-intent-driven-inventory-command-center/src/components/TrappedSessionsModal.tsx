import React, { useState } from 'react';
import { CustomerInteraction, Product } from '../types';
import { X, Search, ShieldAlert, Clock, User, ShoppingBag } from 'lucide-react';

interface TrappedSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  interactions: CustomerInteraction[];
  products: Product[];
  trappedSessionIds: Set<string>;
  isFlushed: boolean;
}

export const TrappedSessionsModal: React.FC<TrappedSessionsModalProps> = ({
  isOpen,
  onClose,
  interactions,
  products,
  trappedSessionIds,
  isFlushed
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const productMap: Record<string, Product> = {};
  products.forEach((p) => {
    productMap[p.Product_ID] = p;
  });

  // Get interactions that were trapped
  const trappedInteractions = interactions
    .filter((i) => i.Interaction_Type === 'Add_to_Cart' && trappedSessionIds.has(i.Session_ID))
    .slice(0, 100); // Display sample of 100

  const filtered = trappedInteractions.filter(
    (i) =>
      i.Session_ID.toLowerCase().includes(search.toLowerCase()) ||
      i.Customer_ID.toLowerCase().includes(search.toLowerCase()) ||
      i.Product_ID.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/75 backdrop-blur-xs">
      <div className="bg-white border border-[#141414] max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#141414] bg-[#E4E3E0] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#141414] text-[#F27D26] flex items-center justify-center rounded-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight italic font-editorial text-[#141414]">
                Trapped Abandoned Sessions Inspector
              </h3>
              <p className="text-[10px] font-mono text-[#141414]/60">
                Sessions with Add_to_Cart events that failed payment with no matching Order_ID.
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

        {/* Search bar & telemetry */}
        <div className="p-3 border-b border-[#141414] bg-[#E4E3E0]/30 flex items-center justify-between font-mono">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#141414]/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Session ID, Customer ID..."
              className="w-full pl-8 pr-2.5 py-1 text-xs rounded-xs border border-[#141414] focus:outline-none focus:ring-1 focus:ring-[#F27D26] bg-white font-mono"
            />
          </div>
          <span className="text-xs">
            Status: {isFlushed ? (
              <span className="text-emerald-700 font-bold uppercase text-[10px] bg-emerald-100 px-2 py-0.5 border border-emerald-300 rounded-xs">
                Flushed / Released
              </span>
            ) : (
              <span className="text-red-700 font-bold uppercase text-[10px] bg-red-100 px-2 py-0.5 border border-red-300 rounded-xs">
                Phantom Locked
              </span>
            )}
          </span>
        </div>

        {/* List of sample interactions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-[#141414]/50 py-8 font-mono">No trapped sessions match your query.</p>
          ) : (
            filtered.map((item) => {
              const product = productMap[item.Product_ID];
              return (
                <div
                  key={item.Interaction_ID}
                  className="p-3 border border-[#141414]/20 hover:border-[#141414] bg-[#E4E3E0]/20 hover:bg-[#E4E3E0]/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs rounded-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold px-1.5 py-0.5 bg-[#141414] text-white text-[10px] rounded-xs">
                      {item.Session_ID}
                    </span>
                    <div className="flex items-center space-x-1 text-[#141414]/60 text-[11px]">
                      <User className="w-3 h-3" />
                      <span>{item.Customer_ID}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[#141414]/50 text-[10px]">
                      <Clock className="w-3 h-3" />
                      <span>{item.Timestamp}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 font-sans font-semibold text-[#141414]">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#F27D26]" />
                      <span>{product?.Product_Name || item.Product_ID}</span>
                    </div>
                    <span className="font-bold text-[#141414]">
                      ₹{product?.Price.toFixed(2)}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 rounded-xs">
                      Gateway Glitch
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-5 py-3 bg-[#E4E3E0] border-t border-[#141414] flex justify-end font-mono">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-bold uppercase bg-[#141414] hover:bg-[#F27D26] text-white transition-colors rounded-xs shadow-xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

