import React from 'react';
import { Printer, Download, X, Copy, ShieldCheck, QrCode } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { FiscalInvoice, Sale } from '../../types';

interface DanfeModalProps {
  invoice: FiscalInvoice | null;
  onClose: () => void;
}

export const DanfeModal: React.FC<DanfeModalProps> = ({ invoice, onClose }) => {
  const { company, sales, fiscalConfig } = useStore();

  if (!invoice) return null;

  const sale = sales.find((s) => s.id === invoice.saleId || s.fiscalInvoiceId === invoice.id);

  const formatKey = (key: string) => {
    return key.replace(/(\d{4})/g, '$1 ').trim();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadXml = () => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe${invoice.accessKey}" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>${invoice.accessKey.slice(-9, -1)}</cNF>
        <natOp>${invoice.naturezaOperacao}</natOp>
        <mod>${invoice.type === 'NFE' ? '55' : '65'}</mod>
        <serie>${invoice.series}</serie>
        <nNF>${invoice.number}</nNF>
        <dhEmi>${invoice.emissionDate}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>${invoice.accessKey.slice(-1)}</cDV>
        <tpAmb>${fiscalConfig.environment === 'producao' ? '1' : '2'}</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>1</indPres>
        <procEmi>0</procEmi>
        <verProc>MultiVariedades_v1.0</verProc>
      </ide>
      <emit>
        <CNPJ>${company.cnpj.replace(/\D/g, '')}</CNPJ>
        <xNome>${company.corporateName}</xNome>
        <xFant>${company.tradeName}</xFant>
        <enderEmit>
          <xLgr>${company.address.street}</xLgr>
          <nro>${company.address.number}</nro>
          <xBairro>${company.address.neighborhood}</xBairro>
          <cMun>3550308</cMun>
          <xMun>${company.address.city}</xMun>
          <UF>${company.address.state}</UF>
          <CEP>${company.address.cep.replace(/\D/g, '')}</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
          <fone>${company.phone.replace(/\D/g, '')}</fone>
        </enderEmit>
        <IE>${company.stateRegistration.replace(/\D/g, '')}</IE>
        <CRT>${company.crt}</CRT>
      </emit>
      <total>
        <ICMSTot>
          <vBC>0.00</vBC>
          <vICMS>0.00</vICMS>
          <vProd>${invoice.totalProducts.toFixed(2)}</vProd>
          <vDesc>${invoice.totalDiscount.toFixed(2)}</vDesc>
          <vNF>${invoice.totalInvoice.toFixed(2)}</vNF>
          <vTotTrib>${invoice.taxEstimatedTotal.toFixed(2)}</vTotTrib>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>${fiscalConfig.environment === 'producao' ? '1' : '2'}</tpAmb>
      <verAplic>SP_NFE_PL_009_V4</verAplic>
      <chNFe>${invoice.accessKey}</chNFe>
      <dhRecbto>${invoice.emissionDate}</dhRecbto>
      <nProt>${invoice.protocol}</nProt>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NFe_${invoice.accessKey}.xml`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base">
              DANFE Oficial - Documento Auxiliar da Nota Fiscal Eletrônica (SEFAZ)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-download-xml"
              onClick={handleDownloadXml}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar XML
            </button>
            <button
              type="button"
              id="btn-print-danfe"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir DANFE (A4)
            </button>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* OFFICIAL DANFE A4 LAYOUT */}
        <div className="p-8 max-h-[80vh] overflow-y-auto font-sans text-xs text-slate-900 bg-white printable-document space-y-3">
          {/* Top Receipt Stub */}
          <div className="border border-slate-900 p-2 text-[10px] space-y-1">
            <div className="flex justify-between">
              <span>RECEBEMOS DE {company.corporateName} OS PRODUTOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO</span>
              <span className="font-bold">NF-e Nº {invoice.number} SÉRIE {invoice.series}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-400">
              <span>DATA DE RECEBIMENTO: ____/____/________</span>
              <span>IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR: _________________________________________</span>
            </div>
          </div>

          {/* Main DANFE Header Box */}
          <div className="border border-slate-900 grid grid-cols-12">
            {/* Emitente Info */}
            <div className="col-span-5 p-3 border-r border-slate-900 space-y-1">
              <h2 className="font-extrabold text-sm uppercase">{company.tradeName}</h2>
              <p className="font-bold text-xs">{company.corporateName}</p>
              <p className="text-[11px] text-slate-700">
                {company.address.street}, Nº {company.address.number} {company.address.complement ? `- ${company.address.complement}` : ''}
              </p>
              <p className="text-[11px] text-slate-700">
                Bairro: {company.address.neighborhood} - {company.address.city}/{company.address.state} - CEP: {company.address.cep}
              </p>
              <p className="text-[11px]">Telefone: {company.phone}</p>
            </div>

            {/* DANFE Center Info */}
            <div className="col-span-3 p-3 border-r border-slate-900 text-center flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-base tracking-widest">DANFE</h3>
                <p className="text-[9px] leading-tight">DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA</p>
                <div className="text-[10px] font-bold mt-1">
                  0 - ENTRADA<br />
                  1 - SAÍDA <span className="border border-slate-900 px-1 ml-1">1</span>
                </div>
              </div>
              <div>
                <p className="font-bold text-xs">Nº {invoice.number.toString().padStart(9, '0')}</p>
                <p className="font-bold text-[11px]">SÉRIE: {invoice.series}</p>
                <p className="text-[9px]">FOLHA 1/1</p>
              </div>
            </div>

            {/* 44 Digits Key & Barcode */}
            <div className="col-span-4 p-3 flex flex-col justify-between space-y-2">
              <div className="text-center">
                <span className="font-bold text-[10px] block">CHAVE DE ACESSO</span>
                <span className="font-mono font-bold text-[10px] tracking-wider select-all block bg-slate-50 p-1 border border-slate-300">
                  {formatKey(invoice.accessKey)}
                </span>
              </div>
              <div className="text-center text-[9px] text-slate-600">
                Consulta de autenticidade no portal nacional da NF-e www.nfe.fazenda.gov.br/portal ou no site da Sefaz Autorizadora
              </div>
              <div className="text-[10px] border-t border-slate-400 pt-1">
                <span className="font-bold">PROTOCOLO DE AUTORIZAÇÃO DE USO</span>
                <p className="font-mono font-bold">{invoice.protocol} - {new Date(invoice.emissionDate).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>

          {/* Natureza da Operacao, IE, CNPJ */}
          <div className="border border-slate-900 grid grid-cols-12 text-[10px]">
            <div className="col-span-6 p-1.5 border-r border-slate-900">
              <span className="font-bold text-[9px] text-slate-500 block">NATUREZA DA OPERAÇÃO</span>
              <span className="font-bold">{invoice.naturezaOperacao}</span>
            </div>
            <div className="col-span-3 p-1.5 border-r border-slate-900">
              <span className="font-bold text-[9px] text-slate-500 block">INSCRIÇÃO ESTADUAL</span>
              <span className="font-bold font-mono">{company.stateRegistration}</span>
            </div>
            <div className="col-span-3 p-1.5">
              <span className="font-bold text-[9px] text-slate-500 block">CNPJ</span>
              <span className="font-bold font-mono">{company.cnpj}</span>
            </div>
          </div>

          {/* DESTINATÁRIO / REMETENTE */}
          <div className="border border-slate-900 space-y-0 text-[10px]">
            <div className="bg-slate-200 px-2 py-0.5 font-bold uppercase text-[9px]">
              DESTINATÁRIO / REMETENTE
            </div>
            <div className="grid grid-cols-12 border-t border-slate-900">
              <div className="col-span-7 p-1.5 border-r border-slate-900">
                <span className="text-[8px] text-slate-500 block">NOME / RAZÃO SOCIAL</span>
                <span className="font-bold">{invoice.recipientName || 'CONSUMIDOR FINAL'}</span>
              </div>
              <div className="col-span-3 p-1.5 border-r border-slate-900">
                <span className="text-[8px] text-slate-500 block">CNPJ / CPF</span>
                <span className="font-bold font-mono">{invoice.recipientDocument || 'NÃO INFORMADO'}</span>
              </div>
              <div className="col-span-2 p-1.5">
                <span className="text-[8px] text-slate-500 block">DATA DA EMISSÃO</span>
                <span className="font-bold">{new Date(invoice.emissionDate).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* CÁLCULO DO IMPOSTO */}
          <div className="border border-slate-900 text-[10px]">
            <div className="bg-slate-200 px-2 py-0.5 font-bold uppercase text-[9px]">
              CÁLCULO DO IMPOSTO
            </div>
            <div className="grid grid-cols-5 border-t border-slate-900 text-center">
              <div className="p-1.5 border-r border-slate-900">
                <span className="text-[8px] text-slate-500 block">BASE DE CÁLCULO DO ICMS</span>
                <span className="font-bold">0,00</span>
              </div>
              <div className="p-1.5 border-r border-slate-900">
                <span className="text-[8px] text-slate-500 block">VALOR DO ICMS</span>
                <span className="font-bold">0,00</span>
              </div>
              <div className="p-1.5 border-r border-slate-900">
                <span className="text-[8px] text-slate-500 block">TOTAL DOS PRODUTOS</span>
                <span className="font-bold">R$ {invoice.totalProducts.toFixed(2)}</span>
              </div>
              <div className="p-1.5 border-r border-slate-900">
                <span className="text-[8px] text-slate-500 block">VALOR DO DESCONTO</span>
                <span className="font-bold text-rose-700">R$ {invoice.totalDiscount.toFixed(2)}</span>
              </div>
              <div className="p-1.5 bg-amber-50">
                <span className="text-[8px] text-slate-500 block">VALOR TOTAL DA NOTA</span>
                <span className="font-extrabold text-sm text-slate-900">R$ {invoice.totalInvoice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* DADOS DOS PRODUTOS / SERVIÇOS */}
          <div className="border border-slate-900 text-[10px]">
            <div className="bg-slate-200 px-2 py-0.5 font-bold uppercase text-[9px]">
              DADOS DOS PRODUTOS / SERVIÇOS
            </div>
            <table className="w-full text-left">
              <thead className="border-t border-b border-slate-900 bg-slate-100 text-[8px] font-bold uppercase">
                <tr>
                  <th className="p-1">CÓD. PROD</th>
                  <th className="p-1">DESCRIÇÃO DO PRODUTO</th>
                  <th className="p-1">NCM/SH</th>
                  <th className="p-1">CST</th>
                  <th className="p-1">CFOP</th>
                  <th className="p-1">UN</th>
                  <th className="p-1 text-right">QTD</th>
                  <th className="p-1 text-right">V.UNIT</th>
                  <th className="p-1 text-right">V.TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {sale?.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-1 font-mono">{item.product.sku || item.product.barcode.slice(-6)}</td>
                    <td className="p-1 font-bold">{item.product.name}</td>
                    <td className="p-1 font-mono">{item.product.ncm}</td>
                    <td className="p-1 font-mono">{item.product.csosn}</td>
                    <td className="p-1 font-mono">{item.product.cfop}</td>
                    <td className="p-1">{item.product.unit}</td>
                    <td className="p-1 text-right">{item.quantity}</td>
                    <td className="p-1 text-right">{item.unitPrice.toFixed(2)}</td>
                    <td className="p-1 text-right font-bold">{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DADOS ADICIONAIS / INFORMAÇÕES COMPLEMENTARES */}
          <div className="border border-slate-900 text-[9px] p-2 space-y-1">
            <span className="font-bold text-[8px] text-slate-500 uppercase block">INFORMAÇÕES COMPLEMENTARES</span>
            <p>
              DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL. NÃO GERA DIREITO A CRÉDITO FISCAL DE IPI/ICMS.
            </p>
            <p>
              Valor aproximado dos tributos federais e estaduais: R$ {invoice.taxEstimatedTotal.toFixed(2)} ({fiscalConfig.ibptEstimatedTaxPercent}%) Fonte: IBPT.
            </p>
            <p>
              Venda Referência: <strong>{sale?.code}</strong> • Operador de Caixa: {sale?.cashierName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
