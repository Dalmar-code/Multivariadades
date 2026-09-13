import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// GS1 Modulo 10 Check Digit calculation for EAN-13
export function calculateEan13CheckDigit(base12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(base12[i], 10) || 0;
    // Odd positions (0-indexed: 0, 2, 4...) weight 1, Even positions (1, 3, 5...) weight 3
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

export function generateStandardEan13(prefix: string, identifierSeed?: number): string {
  // prefix can be "20" (bulk), "22" (fractioned pack), "789" (standard retail), etc.
  const cleanPrefix = prefix.replace(/\D/g, "");
  const remainingLength = 12 - cleanPrefix.length;
  
  let randomBody = "";
  if (identifierSeed) {
    const seedStr = identifierSeed.toString().padStart(remainingLength, "0").slice(-remainingLength);
    randomBody = seedStr;
  } else {
    for (let i = 0; i < remainingLength; i++) {
      randomBody += Math.floor(Math.random() * 10).toString();
    }
  }

  const base12 = (cleanPrefix + randomBody).slice(0, 12);
  const checkDigit = calculateEan13CheckDigit(base12);
  return `${base12}${checkDigit}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "MultiVariedades ERP API" });
  });

  // AI Barcode Generation API Route
  app.post("/api/gemini/generate-barcode", async (req, res) => {
    try {
      const {
        productName = "",
        category = "Ferragens",
        unit = "UN",
        brand = "",
        saleType = "granel", // "granel", "fracionado", "proprio", "linear", "auto"
        customContext = "",
      } = req.body || {};

      let ai: GoogleGenAI | null = null;
      if (process.env.GEMINI_API_KEY) {
        ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
      }

      // Default prefix determination according to GS1 Brazil restricted circulation / internal store standards
      let targetPrefix = "20"; // GS1 retail internal prefix for weight / bulk
      let scenarioTitle = "Venda a Granel / Balança";
      if (saleType === "fracionado" || unit === "PCT" || unit === "CX") {
        targetPrefix = "22";
        scenarioTitle = "Fracionamento de Pacote / Fardo";
      } else if (saleType === "linear" || unit === "MT" || unit === "ROLO") {
        targetPrefix = "25";
        scenarioTitle = "Venda Linear por Metro / Rolo";
      } else if (saleType === "proprio") {
        targetPrefix = "789";
        scenarioTitle = "Marca Própria / Varejo Interno";
      }

      let generatedBarcode = "";
      let suggestedSku = "";
      let explanation = "";
      let packagingAdvice = "";

      if (ai) {
        try {
          const prompt = `Você é um especialista em logística comercial, automação de lojas de materiais de construção, variedades, ferragens e códigos de barras GS1 Brasil.
O lojista precisa criar um código de barras EAN-13 para um produto que chegou em pacotes/fardos para vender fracionado ou a granel, ou que não possui código do fabricante.

Dados do Produto:
- Nome do Produto: "${productName || "Produto a Granel"}"
- Categoria: "${category}"
- Unidade de Medida: "${unit}"
- Marca: "${brand || "Loja"}"
- Tipo de Venda Solicitada: "${saleType}" (${scenarioTitle})
- Informações Adicionais do Lojista: "${customContext || "Nenhuma"}"

Regras Técnicas para Geração do EAN-13:
1. Códigos internos de loja e pesagem/granel utilizam prefixos GS1 Brasil (iniciados com 20, 21, 22, 23, 24, 25) ou prefixo 7899... com exatamente 12 dígitos numéricos de base.
2. Gere os primeiros 12 dígitos ideais (ex: 2000... para granel/balança, 2200... para pacotes fracionados, 2500... para metragem, ou 7899... para produtos próprios).
3. Crie um SKU profissional e mnemônico (ex: GRA-PARAF-8MM ou FRAC-PREGO-17X27).
4. Dê uma explicação clara de 1 a 2 frases de por que esse código e padrão facilitam a bipagem no PDV e balanças.
5. Dê uma dica prática de rotulagem/etiquetagem.

Responda exclusivamente em formato JSON com o schema:
{
  "base12": "string com exatamente 12 dígitos numéricos",
  "suggestedSku": "string com o SKU mnemônico",
  "barcodeType": "string com o tipo (ex: EAN-13 Granel Balança)",
  "explanation": "string explicando a lógica do código para o lojista",
  "packagingAdvice": "string com dicas de rotulagem e impressão de etiquetas"
}`;

          const aiResponse = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });

          const rawText = aiResponse.text || "{}";
          const parsed = JSON.parse(rawText);

          if (parsed.base12 && /^\d{12}$/.test(parsed.base12)) {
            const check = calculateEan13CheckDigit(parsed.base12);
            generatedBarcode = `${parsed.base12}${check}`;
          } else {
            generatedBarcode = generateStandardEan13(targetPrefix);
          }

          suggestedSku = parsed.suggestedSku || `${unit}-${Math.floor(1000 + Math.random() * 9000)}`;
          explanation = parsed.explanation || `Código EAN-13 padrão GS1 gerado para comercialização e identificação interna de itens ${scenarioTitle.toLowerCase()}.`;
          packagingAdvice = parsed.packagingAdvice || `Imprima etiquetas térmicas adesivas com código de barras e cole no saco plástico ou na caixa organizadora do balcão.`;
          scenarioTitle = parsed.barcodeType || scenarioTitle;
        } catch (geminiError) {
          console.warn("Gemini generation fallback used:", geminiError);
          generatedBarcode = generateStandardEan13(targetPrefix);
          suggestedSku = `${category.slice(0, 3).toUpperCase()}-${unit}-${Math.floor(100 + Math.random() * 900)}`;
          explanation = `Código EAN-13 gerado com prefixo restrito GS1 (${targetPrefix}) com dígito verificador matemático Módulo 10 para ${scenarioTitle.toLowerCase()}.`;
          packagingAdvice = `Cole a etiqueta com o código EAN-13 na gôndola, prateleira ou saco fracionado para bipagem direta no caixa PDV.`;
        }
      } else {
        // Fallback when API key is not configured
        generatedBarcode = generateStandardEan13(targetPrefix);
        suggestedSku = `${category.slice(0, 3).toUpperCase()}-${unit}-${Math.floor(100 + Math.random() * 900)}`;
        explanation = `Código EAN-13 gerado com algoritmo GS1 Brasil padrão Módulo 10 (Prefixo ${targetPrefix}) específico para ${scenarioTitle.toLowerCase()}.`;
        packagingAdvice = `Identifique o produto fracionado ou a granel com etiqueta de código de barras para leitura ágil no leitor laser do PDV.`;
      }

      // Ensure valid 13 digits and valid check digit
      if (!generatedBarcode || generatedBarcode.length !== 13) {
        generatedBarcode = generateStandardEan13(targetPrefix);
      }

      res.json({
        success: true,
        barcode: generatedBarcode,
        sku: suggestedSku,
        barcodeType: scenarioTitle,
        explanation,
        packagingAdvice: packagingAdvice || "Imprima etiquetas com código de barras para identificação ágil no PDV.",
        isCheckDigitValid: true,
      });
    } catch (error: any) {
      console.error("Error generating barcode:", error);
      const fallbackCode = generateStandardEan13("20");
      res.status(200).json({
        success: true,
        barcode: fallbackCode,
        sku: `GRANEL-${Math.floor(100 + Math.random() * 900)}`,
        barcodeType: "EAN-13 Padrão Granel",
        explanation: "Código EAN-13 gerado com algoritmo matemático Módulo 10.",
        packagingAdvice: "Utilize etiquetas adesivas nos recipientes de venda.",
        isCheckDigitValid: true,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
