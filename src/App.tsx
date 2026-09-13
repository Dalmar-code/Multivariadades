/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { PDVView } from './components/pos/PDVView';
import { SellerView } from './components/seller/SellerView';
import { ProductCatalog } from './components/products/ProductCatalog';
import { ClientManager } from './components/clients/ClientManager';
import { FiscalManager } from './components/fiscal/FiscalManager';
import { FinancialManager } from './components/financial/FinancialManager';
import { OperationalReports } from './components/reports/OperationalReports';
import { UserManager } from './components/users/UserManager';
import { CompanySettings } from './components/company/CompanySettings';
import { CompanyOnboarding } from './components/company/CompanyOnboarding';
import { BranchManager } from './components/branches/BranchManager';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { LandingPage } from './components/landing/LandingPage';
import { VaccineManager } from './components/vaccines/VaccineManager';
import { ExpirationControl } from './components/products/ExpirationControl';
import { DepartmentCategoryManager } from './components/categories/DepartmentCategoryManager';
import { UserManual } from './components/manual/UserManual';
import { ThermalReceiptModal } from './components/pos/ThermalReceiptModal';
import { DanfeModal } from './components/fiscal/DanfeModal';
import { PetShopModule } from './components/petshop/PetShopModule';
import { TreasuryReconciliation } from './components/pos/TreasuryReconciliation';
import {
  LayoutDashboard,
  ShoppingCart,
  Tag,
  Package,
  Users,
  Receipt,
  DollarSign,
  BarChart3,
  Building2,
  UserCheck,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    switchUserRole,
    isCompanyConfigured,
    selectedSaleForReceipt,
    setSelectedSaleForReceipt,
    selectedInvoiceForDanfe,
    setSelectedInvoiceForDanfe,
  } = useStore();

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register_admin' | 'create_company'>('login');
  const [showLandingPage, setShowLandingPage] = useState<boolean>(false);

  // Enforce role-based initial tabs
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setAuthModalOpen(false);

    if (activeTab === 'landing') {
      return;
    }

    if (currentUser.role === 'superadmin') {
      setActiveTab('superadmin');
      return;
    }

    if (!isCompanyConfigured) {
      setActiveTab('empresa');
      return;
    }

    if (currentUser.role === 'cashier') {
      setActiveTab('pdv');
    } else if (currentUser.role === 'seller') {
      setActiveTab('vendas');
    }
  }, [currentUser, isCompanyConfigured, activeTab, setActiveTab]);

  // If user is logged out, ALWAYS render the dedicated LoginPage first to allow validating a new user
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans antialiased">
        <LoginPage
          onOpenRegisterCompany={() => {
            setAuthModalMode('create_company');
            setAuthModalOpen(true);
          }}
          onOpenRegisterAdmin={() => {
            setAuthModalMode('create_company');
            setAuthModalOpen(true);
          }}
          onOpenPlans={() => {
            setShowLandingPage(true);
          }}
        />

        {/* Auth & Company Registration Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
        />
      </div>
    );
  }

  // If user requested Landing Page or is in landing tab
  if (activeTab === 'landing' || showLandingPage) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
        <LandingPage
          onEnterApp={() => {
            setShowLandingPage(false);
            if (currentUser?.role === 'superadmin') {
              setActiveTab('superadmin');
            } else {
              setActiveTab('dashboard');
            }
          }}
          onOpenSuperAdminLogin={() => {
            setShowLandingPage(false);
            setAuthModalMode('login');
            setAuthModalOpen(true);
          }}
        />

        {/* Auth & Company Registration Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
        />
      </div>
    );
  }

  const renderActiveView = () => {
    if (!currentUser) {
      return null;
    }

    // Super Admin Exclusive View
    if (currentUser.role === 'superadmin' || activeTab === 'superadmin') {
      return <SuperAdminDashboard />;
    }

    // If company is not yet configured, first lead the user to company onboarding
    if (!isCompanyConfigured) {
      return <CompanyOnboarding />;
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
      case 'dashboard':
        return <DashboardOverview />;
      case 'pdv':
        return <PDVView />;
      case 'vendas':
        return <SellerView />;
      case 'filiais':
        return <BranchManager />;
      case 'produtos':
        return <ProductCatalog />;
      case 'validades':
        return <ExpirationControl />;
      case 'departamentos':
        return <DepartmentCategoryManager />;
      case 'petshop':
        return <PetShopModule />;
      case 'vacinas':
        return <VaccineManager />;
      case 'clientes':
        return <ClientManager />;
      case 'tesouraria':
        return <TreasuryReconciliation />;
      case 'fiscal':
        return <FiscalManager />;
      case 'financeiro':
        return <FinancialManager />;
      case 'relatorios':
        return <OperationalReports />;
      case 'usuarios':
        return <UserManager />;
      case 'empresa':
        return <CompanySettings />;
      case 'manual':
        return <UserManual />;
      default:
        return <DashboardOverview />;
    }
  };

  const mobileNavItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'pdv', label: 'PDV', icon: ShoppingCart },
    { id: 'vendas', label: 'Vendas', icon: Tag },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'fiscal', label: 'Fiscal', icon: Receipt },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  ];

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
        {/* Left Role-Restricted Sidebar (Desktop) */}
        <Sidebar />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-100 pb-20 lg:pb-8">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only for Admin on small screens once company is configured) */}
      {currentUser?.role === 'admin' && isCompanyConfigured && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 flex items-center justify-around py-2 px-1 shadow-lg no-print">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
                  isActive
                    ? 'text-amber-700 font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-amber-100' : ''}`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-700' : 'text-slate-500'}`} />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

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
