import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { JERSEY_CATALOG } from "./src/data";
import { DEFAULT_SITE_CONFIG } from "./src/config";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Setup generous limit for handling high fidelity base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const CATALOG_FILE = path.join(process.cwd(), "catalog.json");
const CONFIG_FILE = path.join(process.cwd(), "site-config.json");
const VIP_MEMBERS_FILE = path.join(process.cwd(), "vip-members.json");
const COUPONS_FILE = path.join(process.cwd(), "coupons.json");

const DEFAULT_VIP_MEMBERS = [
  { name: "Marco Latapiat", date: "15/06/2026", status: "Ativo" },
  { name: "Gabriel Souza", date: "14/06/2026", status: "Ativo" },
  { name: "Amanda Oliveira", date: "13/06/2026", status: "Ativo" },
  { name: "Bruno Mendes", date: "12/06/2026", status: "Ativo" }
];

const DEFAULT_COUPONS = [
  { code: "WEST10", discount: "10%", type: "Fixo", status: "Ativo" },
  { code: "VIPWEST", discount: "15%", type: "VIP", status: "Ativo" },
  { code: "FRETEGRATIS", discount: "R$ 20", type: "Frete", status: "Ativo" },
  { code: "ATACADO5", discount: "5%", type: "Volume", status: "Ativo" }
];

// Helper to get admin password from env or default
function getServerAdminPassword(): string {
  return (process.env.ADMIN_PASSWORD || "admin").trim();
}

// Helper to clean up any user-entered Supabase URL that might have trailing slashes or /rest/v1 appended
function sanitizeSupabaseUrl(url: string | undefined): string | null {
  if (!url) return null;
  let clean = url.trim();
  // Remove trailing slashes
  clean = clean.replace(/\/+$/, "");
  // Remove /rest/v1 suffix if copied from API panel
  clean = clean.replace(/\/rest\/v1\/?$/, "");
  // Remove trailing slashes again
  clean = clean.replace(/\/+$/, "");
  return clean;
}

// Supabase Configuration
const supabaseUrl = sanitizeSupabaseUrl(process.env.SUPABASE_URL);
const supabaseKey = process.env.SUPABASE_SERVICE_KEY ? process.env.SUPABASE_SERVICE_KEY.trim() : undefined;
const isSupabaseEnabled = !!(supabaseUrl && supabaseKey);

let supabase: any = null;
if (isSupabaseEnabled) {
  try {
    supabase = createClient(supabaseUrl!, supabaseKey!);
    console.log("Supabase client initialized successfully with clean url:", supabaseUrl);
  } catch (err: any) {
    console.error("Failed to initialize Supabase client:", err.message);
  }
} else {
  console.log("Supabase credentials missing. Operating in local-fallback mode.");
}

// Map PostgreSQL row to frontend JerseyKit type
function mapToJerseyKit(row: any) {
  return {
    id: row.id,
    name: row.name,
    team: row.team,
    type: row.type,
    season: row.season,
    priceRetail: Number(row.price_retail ?? row.priceRetail ?? (row.is_retro ? 159.90 : 129.90)),
    priceWholesale: Number(row.price_wholesale ?? row.priceWholesale ?? (row.is_retro ? 149.90 : 119.90)),
    isRetro: Boolean(row.is_retro ?? row.isRetro ?? false),
    sponsor: row.sponsor || undefined,
    design: typeof row.design === "string" ? JSON.parse(row.design) : (row.design || {}),
    stock: typeof row.stock === "string" ? JSON.parse(row.stock) : (row.stock || { P: 10, M: 10, G: 10, GG: 10 }),
    imageUrl: row.image_url ?? row.imageUrl ?? undefined
  };
}

// Map frontend JerseyKit to PostgreSQL row
function mapToRow(jk: any) {
  return {
    id: jk.id,
    name: jk.name,
    team: jk.team,
    type: jk.type,
    season: jk.season,
    price_retail: jk.priceRetail,
    price_wholesale: jk.priceWholesale,
    is_retro: jk.isRetro,
    sponsor: jk.sponsor || null,
    design: jk.design || {},
    stock: jk.stock || { P: 10, M: 10, G: 10, GG: 10 },
    image_url: jk.imageUrl || jk.image || null
  };
}

// Ensure initial files exist with default data
function initializeDatabase() {
  // Initialize catalog.json if not exists
  if (!fs.existsSync(CATALOG_FILE)) {
    // Ensure default stock is injected
    const initializedCatalog = JERSEY_CATALOG.map(item => ({
      ...item,
      stock: item.stock || { P: 10, M: 10, G: 10, GG: 10 }
    }));
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(initializedCatalog, null, 2), "utf-8");
    console.log("Initialized catalog.json with default data.");
  } else {
    // Ensure any existing catalog jerseys have stock objects defined
    try {
      const data = fs.readFileSync(CATALOG_FILE, "utf-8");
      const current = JSON.parse(data);
      let updated = false;
      const verified = current.map((item: any) => {
        if (!item.stock) {
          updated = true;
          return {
            ...item,
            stock: { P: 10, M: 10, G: 10, GG: 10 }
          };
        }
        return item;
      });
      if (updated) {
        fs.writeFileSync(CATALOG_FILE, JSON.stringify(verified, null, 2), "utf-8");
        console.log("Migrated and verified stock in catalog.json");
      }
    } catch (e) {
      console.error("Error verifying catalog.json stock", e);
    }
  }

  // Initialize site-config.json if not exists
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_SITE_CONFIG, null, 2), "utf-8");
    console.log("Initialized site-config.json with default config.");
  }

  // Initialize vip-members.json if not exists
  if (!fs.existsSync(VIP_MEMBERS_FILE)) {
    fs.writeFileSync(VIP_MEMBERS_FILE, JSON.stringify(DEFAULT_VIP_MEMBERS, null, 2), "utf-8");
    console.log("Initialized vip-members.json with default config.");
  }

  // Initialize coupons.json if not exists
  if (!fs.existsSync(COUPONS_FILE)) {
    fs.writeFileSync(COUPONS_FILE, JSON.stringify(DEFAULT_COUPONS, null, 2), "utf-8");
    console.log("Initialized coupons.json with default config.");
  }
}

initializeDatabase();

// 1. ADMIN AUTH LOGIN API
app.post("/api/auth/login", (req, res) => {
  const { password } = req.body;
  const expectedPassword = getServerAdminPassword();

  if (password === expectedPassword) {
    res.json({ success: true, message: "Acesso autorizado!" });
  } else {
    res.status(401).json({ success: false, message: "Senha incorreta!" });
  }
});

// 2. GET CONNECTED SUPABASE STATUS API
app.get("/api/supabase-status", (req, res) => {
  res.json({
    enabled: isSupabaseEnabled,
    url: supabaseUrl ? supabaseUrl.replace(/(https?:\/\/)[^.]+(\.supabase\.\w+)/, "$1***$2") : null,
    hasKey: !!supabaseKey
  });
});

// 3. GET CATALOG API (Queries live Supabase table if enabled, falls back to disk)
app.get("/api/catalog", async (req, res) => {
  if (isSupabaseEnabled && supabase) {
    try {
      const { data, error } = await supabase
        .from("catalog")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mappedCatalog = data.map(mapToJerseyKit);
        return res.json(mappedCatalog);
      } else if (error) {
        console.warn("Supabase database catalog read error (maybe table not migrated yet?):", error.message);
      }
    } catch (err: any) {
      console.error("Unexpected Supabase load error:", err.message);
    }
  }

  // Local JSON fallback
  try {
    if (fs.existsSync(CATALOG_FILE)) {
      const data = fs.readFileSync(CATALOG_FILE, "utf-8");
      return res.json(JSON.parse(data));
    }
    return res.json([]);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao carregar o catálogo local", details: err.message });
  }
});

// 4. POST Catalog Update API (Saves locally AND updates/deletes in Supabase table)
app.post("/api/catalog", async (req, res) => {
  const adminPasswordHeader = req.headers["x-admin-password"];
  const expectedPassword = getServerAdminPassword();

  if (adminPasswordHeader !== expectedPassword) {
    return res.status(403).json({ error: "Não autorizado para realizar esta ação." });
  }

  const updatedCatalog = req.body;
  if (!Array.isArray(updatedCatalog)) {
    return res.status(400).json({ error: "Dados inválidos: Catálogo deve ser uma lista." });
  }

  // Essential Local Save first
  try {
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(updatedCatalog, null, 2), "utf-8");
  } catch (err: any) {
    console.error("Local catalog disk save error:", err.message);
  }

  // Supabase Save integration
  let supabaseSynced = false;
  let syncError: string | null = null;

  if (isSupabaseEnabled && supabase) {
    try {
      const idsToKeep = updatedCatalog.map((j: any) => j.id);

      // A) Delete pruned/deleted items not in the saved list
      if (idsToKeep.length > 0) {
        const { error: delError } = await supabase
          .from("catalog")
          .delete()
          .not("id", "in", `(${idsToKeep.map(id => `'${id}'`).join(",")})`);
        if (delError) console.warn("Supabase clean up deletion warn:", delError.message);
      } else {
        await supabase.from("catalog").delete().neq("id", "___fallback___");
      }

      // B) Map details to database structures and Upsert
      const rows = updatedCatalog.map(mapToRow);
      const { error: upsertError } = await supabase
        .from("catalog")
        .upsert(rows);

      if (upsertError) {
        syncError = upsertError.message;
        console.error("Supabase upsert error:", upsertError.message);
      } else {
        supabaseSynced = true;
      }
    } catch (e: any) {
      syncError = e.message;
      console.error("Failed to sync catalogue database with Supabase:", e.message);
    }
  }

  res.json({
    success: true,
    message: "Catálogo atualizado com sucesso!",
    supabaseSynced,
    syncError
  });
});

// 5. GET SITE CONFIG API (Queries live Supabase table if enabled, falls back to disk)
app.get("/api/site-config", async (req, res) => {
  if (isSupabaseEnabled && supabase) {
    try {
      const { data, error } = await supabase
        .from("site_config")
        .select("*")
        .eq("id", "default")
        .single();

      if (!error && data) {
        return res.json({
          heroEyebrow: data.hero_eyebrow,
          heroTitle1: data.hero_title_1,
          heroTitleAccent: data.hero_title_accent,
          heroSubtitle: data.hero_subtitle,
          whatsappNumber: data.whatsapp_number,
          instagramHandle: data.instagram_handle,
          vipPrice: data.vip_price,
          vipBenefits: typeof data.vip_benefits === "string" ? JSON.parse(data.vip_benefits) : (data.vip_benefits || [])
        });
      } else if (error) {
        console.warn("Supabase site_config read issue:", error.message);
      }
    } catch (err: any) {
      console.error("Unexpected Supabase site-config load error:", err.message);
    }
  }

  // Local fallback
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      return res.json(JSON.parse(data));
    }
    return res.json(DEFAULT_SITE_CONFIG);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao carregar configurações locais", details: err.message });
  }
});

// 6. POST SITE CONFIG Update API
app.post("/api/site-config", async (req, res) => {
  const adminPasswordHeader = req.headers["x-admin-password"];
  const expectedPassword = getServerAdminPassword();

  if (adminPasswordHeader !== expectedPassword) {
    return res.status(403).json({ error: "Não autorizado para realizar esta ação." });
  }

  const newConfig = req.body;

  // Local Save
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), "utf-8");
  } catch (err: any) {
    console.error("Local disk site-config save error:", err.message);
  }

  // Supabase Save integration
  let supabaseSynced = false;
  if (isSupabaseEnabled && supabase) {
    try {
      const row = {
        id: "default",
        hero_eyebrow: newConfig.heroEyebrow,
        hero_title_1: newConfig.heroTitle1,
        hero_title_accent: newConfig.heroTitleAccent,
        hero_subtitle: newConfig.heroSubtitle,
        whatsapp_number: newConfig.whatsappNumber,
        instagram_handle: newConfig.instagramHandle,
        vip_price: newConfig.vipPrice,
        vip_benefits: newConfig.vipBenefits || []
      };

      const { error } = await supabase
        .from("site_config")
        .upsert(row);

      if (!error) {
        supabaseSynced = true;
      } else {
        console.error("Supabase site_config upsert error:", error.message);
      }
    } catch (e: any) {
      console.error("Failed to sync site_config with Supabase:", e.message);
    }
  }

  res.json({
    success: true,
    message: "Configurações atualizadas com sucesso!",
    supabaseSynced
  });
});

// 6a. GET VIP MEMBERS
app.get("/api/vip-members", async (req, res) => {
  if (isSupabaseEnabled && supabase) {
    try {
      const { data, error } = await supabase
        .from("vip_members")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Map table columns to frontend names: { name, date, status }
        return res.json(data.map((row: any) => ({
          name: row.name,
          date: row.date,
          status: row.status || "Ativo"
        })));
      } else if (error) {
        console.warn("Supabase vip_members select fail:", error.message);
      }
    } catch (err: any) {
      console.error("Unexpected Supabase vip_members query error:", err.message);
    }
  }

  // Fallback to local
  try {
    if (fs.existsSync(VIP_MEMBERS_FILE)) {
      const data = fs.readFileSync(VIP_MEMBERS_FILE, "utf-8");
      return res.json(JSON.parse(data));
    }
    return res.json(DEFAULT_VIP_MEMBERS);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao ler assinantes locais.", details: err.message });
  }
});

// 6b. POST VIP MEMBERS Update
app.post("/api/vip-members", async (req, res) => {
  const adminPasswordHeader = req.headers["x-admin-password"];
  const expectedPassword = getServerAdminPassword();

  if (adminPasswordHeader !== expectedPassword) {
    return res.status(403).json({ error: "Não autorizado." });
  }

  const list = req.body; // Expecting array of { name, date, status }

  // Local Save
  try {
    fs.writeFileSync(VIP_MEMBERS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err: any) {
    console.error("Local disk vip-members save error:", err.message);
  }

  // Supabase Save
  let supabaseSynced = false;
  if (isSupabaseEnabled && supabase) {
    try {
      // Deleta todos os anteriores para sincronizar a lista completa
      await supabase.from("vip_members").delete().neq("status", "___none___");

      if (list && list.length > 0) {
        const rows = list.map((item: any) => ({
          name: item.name,
          date: item.date,
          status: item.status || "Ativo"
        }));
        const { error } = await supabase.from("vip_members").insert(rows);
        if (!error) {
          supabaseSynced = true;
        } else {
          console.error("Supabase vip_members insert error:", error.message);
        }
      } else {
        supabaseSynced = true;
      }
    } catch (e: any) {
      console.error("Failed to sync vip_members with Supabase:", e.message);
    }
  }

  res.json({ success: true, message: "Assinantes VIP atualizados!", supabaseSynced });
});

// 6c. GET COUPONS
app.get("/api/coupons", async (req, res) => {
  if (isSupabaseEnabled && supabase) {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*");

      if (!error && data) {
        return res.json(data.map((row: any) => ({
          code: row.code,
          discount: row.discount,
          type: row.type,
          status: row.status || "Ativo"
        })));
      } else if (error) {
        console.warn("Supabase coupons select fail:", error.message);
      }
    } catch (err: any) {
      console.error("Unexpected Supabase coupons query error:", err.message);
    }
  }

  // Fallback to local
  try {
    if (fs.existsSync(COUPONS_FILE)) {
      const data = fs.readFileSync(COUPONS_FILE, "utf-8");
      return res.json(JSON.parse(data));
    }
    return res.json(DEFAULT_COUPONS);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao ler cupons locais.", details: err.message });
  }
});

// 6d. POST COUPONS Update
app.post("/api/coupons", async (req, res) => {
  const adminPasswordHeader = req.headers["x-admin-password"];
  const expectedPassword = getServerAdminPassword();

  if (adminPasswordHeader !== expectedPassword) {
    return res.status(403).json({ error: "Não autorizado." });
  }

  const list = req.body; // Expecting array of { code, discount, type, status }

  // Local Save
  try {
    fs.writeFileSync(COUPONS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err: any) {
    console.error("Local disk coupons save error:", err.message);
  }

  // Supabase Save
  let supabaseSynced = false;
  if (isSupabaseEnabled && supabase) {
    try {
      // Deleta todos para sincronizar
      await supabase.from("cupons").delete().neq("status", "___none___");
      // Se a tabela for chamada coupons, use coupons
      try {
        await supabase.from("coupons").delete().neq("status", "___none___");
      } catch (e) {}

      if (list && list.length > 0) {
        const rows = list.map((item: any) => ({
          code: item.code,
          discount: item.discount,
          type: item.type,
          status: item.status || "Ativo"
        }));
        // Tenta inserir na principal "coupons", fallback para "cupons"
        let { error } = await supabase.from("coupons").insert(rows);
        if (error) {
          // fallback para "cupons" caso queira as duas
          const resCupons = await supabase.from("cupons").insert(rows);
          error = resCupons.error;
        }

        if (!error) {
          supabaseSynced = true;
        } else {
          console.error("Supabase coupons insert error:", error.message);
        }
      } else {
        supabaseSynced = true;
      }
    } catch (e: any) {
      console.error("Failed to sync coupons with Supabase:", e.message);
    }
  }

  res.json({ success: true, message: "Cupons atualizados!", supabaseSynced });
});

// 7. POST UPLOAD IMAGE TO SUPABASE STORAGE BUCKET
app.post("/api/upload", async (req, res) => {
  const adminPasswordHeader = req.headers["x-admin-password"];
  const expectedPassword = getServerAdminPassword();

  if (adminPasswordHeader !== expectedPassword) {
    return res.status(403).json({ error: "Não autorizado para realizar uploads." });
  }

  if (!isSupabaseEnabled || !supabase) {
    return res.status(400).json({ error: "Supabase não habilitado/configurado no servidor." });
  }

  try {
    const { fileName, base64Data, contentType } = req.body;
    if (!fileName || !base64Data) {
      return res.status(400).json({ error: "Parâmetros fileName e base64Data são obrigatórios." });
    }

    // Strip visual prefix standard headers e.g. "data:image/png;base64,"
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");

    // Upload to 'jersey-images' bucket
    const { data, error } = await supabase.storage
      .from("jersey-images")
      .upload(fileName, buffer, {
        contentType: contentType || "image/png",
        upsert: true
      });

    if (error) {
      throw error;
    }

    // Retrieve public URL
    const { data: publicUrlData } = supabase.storage
      .from("jersey-images")
      .getPublicUrl(fileName);

    res.json({
      success: true,
      imageUrl: publicUrlData.publicUrl
    });
  } catch (err: any) {
    res.status(500).json({ error: "Falha de upload no Supabase Storage", details: err.message });
  }
});

// VITE MIDDLEWARE INTERACTION FOR DEV vs PROD SERVICE
async function mountViteMiddleware() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

mountViteMiddleware().catch(err => {
  console.error("Failed to start server", err);
});
