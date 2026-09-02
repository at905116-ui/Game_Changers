import { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { generateDatasets } from './data/mockDataset';
import { computeInventoryAnalytics, generatePurchaseOrders } from './utils/calculations';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { PhantomStockTab } from './components/PhantomStockTab';
import { RestockCenterTab } from './components/RestockCenterTab';
import { DeadStockTab } from './components/DeadStockTab';
import { PythonExportTab } from './components/PythonExportTab';
import { PurchaseOrderModal } from './components/PurchaseOrderModal';
import { TrappedSessionsModal } from './components/TrappedSessionsModal';
import { Lock, Zap, Package, FileCode, CheckCircle2, Terminal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'restock' | 'phantom' | 'deadstock' | 'python'>('restock');
  const [isFlushed, setIsFlushed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // Generate synthetic dataset representing August with the late August outage
  const rawData = useMemo(() => generateDatasets(), []);

  // Compute reactive analytics
  const analytics = useMemo(() => {
    return computeInventoryAnalytics(
      rawData.products,
      rawData.inventory,
      rawData.interactions,
      rawData.orders,
      isFlushed ? new Set(rawData.interactions.map((i) => i.Session_ID)) : new Set()
    );
  }, [rawData, isFlushed]);

  const purchaseOrders = useMemo(() => {
    return generatePurchaseOrders(analytics.restockAnalysisList);
  }, [analytics.restockAnalysisList]);

  // Average intent uplift (Intent ROP - Traditional ROP)
  const avgIntentUplift = useMemo(() => {
    const uplifts = analytics.restockAnalysisList.map((i) => i.Intent_Aware_ROP - i.Traditional_ROP);
    const avg = uplifts.reduce((a, b) => a + b, 0) / uplifts.length;
    return Number(avg.toFixed(1));
  }, [analytics.restockAnalysisList]);

  const totalLockedUnits = useMemo(() => {
    return analytics.lockedInventoryList.reduce((sum, item) => sum + item.Locked_Units, 0);
  }, [analytics.lockedInventoryList]);

  const handleFlushCarts = () => {
    setIsFlushed(true);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
    setToastMessage('🎉 SUCCESS: All 150+ expired outage carts flushed! Stock returned to active inventory.');
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleReset = () => {
    setIsFlushed(false);
    setToastMessage('🔄 Outage simulation reset to locked cart state.');
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans flex flex-col selection:bg-[#F27D26] selection:text-white">
      {/* Top Header */}
      <Header
        isFlushed={isFlushed}
        onReset={handleReset}
        onOpenPythonTab={() => setActiveTab('python')}
        totalLostRevenue={analytics.totalLostRevenue}
        totalTrappedCarts={analytics.totalTrappedCarts}
        urgentRestockCount={analytics.urgentRestockCount}
      />

      {/* Main High-Density Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 w-full space-y-5">
        {/* Toast Alert Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-3 duration-200">
            <div className="bg-[#141414] text-white px-5 py-3 border border-[#F27D26] shadow-2xl flex items-center space-x-3 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-[#F27D26] shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* 4 Key Header Metrics */}
        <MetricCards
          totalLostRevenue={analytics.totalLostRevenue}
          totalTrappedCarts={analytics.totalTrappedCarts}
          urgentRestockCount={analytics.urgentRestockCount}
          avgIntentUplift={avgIntentUplift}
          isFlushed={isFlushed}
          totalLockedUnits={totalLockedUnits}
        />

        {/* High Density Tabs Bar */}
        <div className="bg-white border border-[#141414] p-1.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-xs">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-0.5" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('restock')}
              className={`flex items-center space-x-2.5 py-2 px-3.5 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap rounded-xs ${
                activeTab === 'restock'
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'text-[#141414]/70 hover:bg-[#E4E3E0] hover:text-[#141414] border border-transparent'
              }`}
            >
              <span className="text-[10px] font-mono opacity-60">01</span>
              <Zap className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>Restock Center</span>
              {analytics.urgentRestockCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-black bg-red-600 text-white rounded-xs">
                  {analytics.urgentRestockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('phantom')}
              className={`flex items-center space-x-2.5 py-2 px-3.5 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap rounded-xs ${
                activeTab === 'phantom'
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'text-[#141414]/70 hover:bg-[#E4E3E0] hover:text-[#141414] border border-transparent'
              }`}
            >
              <span className="text-[10px] font-mono opacity-60">02</span>
              <Lock className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>Phantom Stock</span>
            </button>

            <button
              onClick={() => setActiveTab('deadstock')}
              className={`flex items-center space-x-2.5 py-2 px-3.5 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap rounded-xs ${
                activeTab === 'deadstock'
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'text-[#141414]/70 hover:bg-[#E4E3E0] hover:text-[#141414] border border-transparent'
              }`}
            >
              <span className="text-[10px] font-mono opacity-60">03</span>
              <Package className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>Dead Stock</span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-[#E4E3E0] text-[#141414] rounded-xs">
                {analytics.deadStockItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('python')}
              className={`flex items-center space-x-2.5 py-2 px-3.5 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap rounded-xs ${
                activeTab === 'python'
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'text-[#141414]/70 hover:bg-[#E4E3E0] hover:text-[#141414] border border-transparent'
              }`}
            >
              <span className="text-[10px] font-mono opacity-60">04</span>
              <FileCode className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>Python app.py & CSVs</span>
            </button>
          </nav>

          {/* Quick System Telemetry Log snippet */}
          <div className="hidden lg:flex items-center space-x-3 text-[10px] font-mono text-[#141414]/70 px-3 py-1 bg-[#E4E3E0] border border-[#141414]/20 rounded-xs">
            <Terminal className="w-3 h-3 text-[#F27D26]" />
            <span>[SYS] INTENT_ENGINE: ONLINE</span>
            <span className="opacity-40">|</span>
            <span>DATASET: AUGUST_2026</span>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'restock' && (
          <RestockCenterTab
            restockAnalysis={analytics.restockAnalysisList}
            onGeneratePO={() => setIsPOModalOpen(true)}
          />
        )}

        {activeTab === 'phantom' && (
          <PhantomStockTab
            lockedInventory={analytics.lockedInventoryList}
            isFlushed={isFlushed}
            onFlushCarts={handleFlushCarts}
            onOpenSessionModal={() => setIsSessionModalOpen(true)}
          />
        )}

        {activeTab === 'deadstock' && (
          <DeadStockTab
            deadStockItems={analytics.deadStockItems}
            scatterPlotData={analytics.scatterPlotData}
          />
        )}

        {activeTab === 'python' && (
          <PythonExportTab
            products={rawData.products}
            inventory={rawData.inventory}
            interactions={rawData.interactions}
            orders={rawData.orders}
          />
        )}
      </main>

      {/* Modals */}
      <PurchaseOrderModal
        isOpen={isPOModalOpen}
        onClose={() => setIsPOModalOpen(false)}
        purchaseOrders={purchaseOrders}
      />

      <TrappedSessionsModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        interactions={rawData.interactions}
        products={rawData.products}
        trappedSessionIds={analytics.trappedSessionIds}
        isFlushed={isFlushed}
      />

      {/* High Density Footer */}
      <footer className="mt-auto border-t border-[#141414] bg-white py-3 text-center text-xs text-[#141414]/70">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#141414]">
            Clinkit Data Hackathon 2026 • High-Density Inventory Command
          </span>
          <span className="font-mono text-[11px] text-[#141414]/60">
            Mathematical Engine: ROP = (Daily Intent &times; 3) + 1.65 &times; &sigma;&times;&radic;3
          </span>
        </div>
      </footer>
    </div>
  );
}

