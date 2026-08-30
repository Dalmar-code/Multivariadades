/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { PDVView } from './components/pos/PDVView';
import { SellerView } from './components/seller/SellerView';
import { ProductCatalog } from './components/products/ProductCatalog';
import { ClientManager } from './components/clients/ClientManager';
import { FiscalManager } from './components/fiscal/FiscalManager';
import { FinancialManager } from './components/financial/FinancialManager';
import { OperationalReports } from './components/reports/OperationalReports';
import { UserManager } from './components/users/UserManager';
import { CompanySettings } from './components/company/CompanySettings';
import { ThermalReceiptModal } from './components/pos/ThermalReceiptModal';
import { DanfeModal } from './components/fiscal/DanfeModal';

const AppContent: React.FC = () => {
  const {
    currentUser,
    selectedSaleForReceipt,
    setSelectedSaleForReceipt,
    selectedInvoiceForDanfe,
    setSelectedInvoiceForDanfe,
  } = useStore();

  const [activeTab, setActiveTab] = useState<string>('pos');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register_company'>('login');

  // Enforce role-based initial tabs
  useEffect(() => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    setAuthModalOpen(false);

    if (currentUser.role === 'cashier') {
      setActiveTab('pos');
    } else if (currentUser.role === 'seller') {
      setActiveTab('seller_area');
    }
  }, [currentUser]);

  const handleTabChange = (tab: string) => {
    // Role guard check
    if (currentUser?.role === 'cashier' && tab !== 'pos') {
      return;
    }
    if (currentUser?.role === 'seller' && tab !== 'seller_area') {
      return;
    }
    setActiveTab(tab);
  };

  const renderActiveView = () => {
    if (!currentUser) {
      return null;
    }

    // Role-specific screens
    if (currentUser.role === 'cashier') {
      return <PDVView />;
    }

    if (currentUser.role === 'seller') {
      return <SellerView />;
    }

    // Admin screens
    switch (activeTab) {
      case 'pos':
        return <PDVView />;
      case 'seller_area':
        return <SellerView />;
      case 'products':
        return <ProductCatalog />;
      case 'clients':
        return <ClientManager />;
      case 'fiscal':
        return <FiscalManager />;
      case 'financial':
        return <FinancialManager />;
      case 'reports':
        return <OperationalReports />;
      case 'users':
        return <UserManager />;
      case 'company':
        return <CompanySettings />;
      default:
        return <PDVView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        onOpenAuthModal={(mode) => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Role-Restricted Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-100 pb-16">
          {renderActiveView()}
        </main>
      </div>

      {/* Auth & Company Registration Modal (with Olho Mágico) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          if (currentUser) {
            setAuthModalOpen(false);
          }
        }}
        initialMode={authModalMode}
      />

      {/* Global Thermal Receipt & NFC-e Modal */}
      <ThermalReceiptModal
        sale={selectedSaleForReceipt}
        onClose={() => setSelectedSaleForReceipt(null)}
      />

      {/* Global DANFE Modal */}
      <DanfeModal
        invoice={selectedInvoiceForDanfe}
        onClose={() => setSelectedInvoiceForDanfe(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
