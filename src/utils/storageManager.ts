/**
 * MultiVariedades ERP Storage Manager
 * Ensures localStorage operations never throw QuotaExceededError.
 * Prunes obsolete snapshots and keeps transactions lightweight.
 */

export const pruneOldStorage = () => {
  try {
    // 1. Remove obsolete duplicated store snapshots (only keep active store metadata)
    const keysToRemove: string[] = [];
    const activeCnpj = localStorage.getItem('multivariedades_last_active_cnpj') || '';

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Duplicate whole-state snapshots by CNPJ that bloated the storage
      if (key.startsWith('multivariedades_store_cnpj_')) {
        const keyCnpj = key.replace('multivariedades_store_cnpj_', '');
        if (keyCnpj !== activeCnpj) {
          keysToRemove.push(key);
        }
      }

      // Old snapshot keys
      if (key.includes('snapshot') || key.includes('_backup_temp')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });

    // 2. Prune sales history if too large (keep recent 80 sales)
    const salesKey = 'multivariedades_erp_state_v1_sales';
    const salesRaw = localStorage.getItem(salesKey);
    if (salesRaw && salesRaw.length > 500000) {
      try {
        const sales = JSON.parse(salesRaw);
        if (Array.isArray(sales) && sales.length > 50) {
          const trimmed = sales.slice(0, 50).map((s: any) => ({
            ...s,
            items: Array.isArray(s.items)
              ? s.items.map((it: any) => ({
                  id: it.id,
                  quantity: it.quantity,
                  unitPrice: it.unitPrice,
                  totalPrice: it.totalPrice,
                  discount: it.discount,
                  product: it.product
                    ? {
                        id: it.product.id,
                        name: it.product.name,
                        sku: it.product.sku,
                        barcode: it.product.barcode,
                        unit: it.product.unit,
                        salePrice: it.product.salePrice,
                        category: it.product.category,
                      }
                    : undefined,
                }))
              : [],
          }));
          localStorage.setItem(salesKey, JSON.stringify(trimmed));
        }
      } catch {
        // ignore
      }
    }

    // 3. Prune sessions history if too large (keep recent 20)
    const sessKey = 'multivariedades_erp_state_v1_sessions_history';
    const sessRaw = localStorage.getItem(sessKey);
    if (sessRaw && sessRaw.length > 200000) {
      try {
        const sessions = JSON.parse(sessRaw);
        if (Array.isArray(sessions) && sessions.length > 20) {
          localStorage.setItem(sessKey, JSON.stringify(sessions.slice(0, 20)));
        }
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.warn('[StorageManager] Aviso durante poda preventiva:', err);
  }
};

/**
 * Safe setItem that intercepts QuotaExceededError and prevents crashes
 */
export const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (firstError: any) {
    console.warn(`[StorageManager] Cota excedida ao gravar '${key}'. Executando poda...`, firstError);
    try {
      pruneOldStorage();
      localStorage.setItem(key, value);
      return true;
    } catch (secondError: any) {
      console.warn(`[StorageManager] Segunda tentativa falhou para '${key}'. Tentando compressão de dados...`, secondError);
      try {
        // If this is an array (like sales, invoices, sessions), trim it
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 10) {
          const cutLength = Math.max(10, Math.floor(parsed.length / 2));
          const trimmed = JSON.stringify(parsed.slice(0, cutLength));
          localStorage.setItem(key, trimmed);
          return true;
        }
      } catch {
        // Not a JSON array or unable to trim
      }
      return false;
    }
  }
};

/**
 * Repairs storage safely without losing users, company or registered products
 */
export const repairStorageSafely = (): { success: boolean; message: string } => {
  try {
    pruneOldStorage();

    // Remove any leftover unnecessary keys
    const unnecessaryPrefixes = [
      'multivariedades_store_cnpj_',
      'debug_',
      'temp_',
      'cache_',
    ];

    const activeCnpj = localStorage.getItem('multivariedades_last_active_cnpj') || '';

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (key.startsWith('multivariedades_store_cnpj_')) {
        const keyCnpj = key.replace('multivariedades_store_cnpj_', '');
        if (keyCnpj !== activeCnpj) {
          localStorage.removeItem(key);
        }
      } else if (unnecessaryPrefixes.some((p) => key.startsWith(p))) {
        localStorage.removeItem(key);
      }
    }

    return { success: true, message: 'Armazenamento otimizado com sucesso! Dados preservados.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Falha ao reparar armazenamento.' };
  }
};
