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

const isVercel = !!process.env.VERCEL;
const baseDir = isVercel ? "/tmp" : process.cwd();

const CATALOG_FILE = path.join(baseDir, "catalog.json");
const CONFIG_FILE = path.join(baseDir, "site-config.json");
const VIP_MEMBERS_FILE = path.join(baseDir, "vip-members.json");
const COUPONS_FILE = path.join(baseDir, "coupons.json");
const ORDERS_FILE = path.join(baseDir, "orders.json");
const REVIEWS_FILE = path.join(baseDir, "reviews.json");

// If running in Vercel, copy initial seeded files from read-only project root to writable /tmp
if (isVercel) {
  const filesToCopy = ["catalog.json", "site-config.json", "vip-members.json", "coupons.json", "orders.json", "reviews.json"];
  filesToCopy.forEach(file => {
    const src = path.join(process.cwd(), file);
    const dest = path.join("/tmp", file);
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      try {
        fs.copyFileSync(src, dest);
        console.log(`Copied ${file} to /tmp successfully for write access.`);
      } catch (err: any) {
        console.error(`Failed to copy ${file} to /tmp:`, err.message);
      }
    }
  });
}

const DEFAULT_VIP_MEMBERS: any[] = [];

const DEFAULT_COUPONS: any[] = [];

const DEFAULT_REVIEWS: any[] = [];

const DEFAULT_ORDERS: any[] = [];

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
  // If catalog.json exists and has mock products, or doesn't exist, we start empty
  let isMockCatalogStatus = false;
  if (fs.existsSync(CATALOG_FILE)) {
    try {
      const data = fs.readFileSync(CATALOG_FILE, "utf-8");
      if (data.includes("spfc-home-24-25") || data.includes("fla-home-25-26") || data.includes("cor-home-25-26")) {
        isMockCatalogStatus = true;
      }
    } catch {}
  }

  if (isMockCatalogStatus || !fs.existsSync(CATALOG_FILE)) {
    fs.writeFileSync(CATALOG_FILE, "[]", "utf-8");
    console.log("Initialized catalog.json as empty.");
  }

  // Ensure default site configuration exists
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_SITE_CONFIG, null, 2), "utf-8");
    console.log("Initialized site-config.json with default config.");
  } else {
    // Force set the vipPrice to R$ 7.50 if it was loaded as 49.90 or anything else
    try {
      const configData = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      if (configData.vipPrice === "49.90" || configData.vipPrice !== "7,50") {
        configData.vipPrice = "7,50";
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2), "utf-8");
        console.log("Forced correction of vipPrice to 7,50 locally.");
      }
    } catch {}
  }

  // Synchronize site-config with Supabase on startup to avoid stale DB entries overruling local settings
  if (isSupabaseEnabled && supabase) {
    try {
      const configData = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      const row = {
        id: "default",
        hero_eyebrow: configData.heroEyebrow,
        hero_title_1: configData.heroTitle1,
        hero_title_accent: configData.heroTitleAccent,
        hero_subtitle: configData.heroSubtitle,
        whatsapp_number: configData.whatsappNumber,
        instagram_handle: configData.instagramHandle,
        vip_price: configData.vipPrice,
        vip_benefits: configData.vipBenefits || []
      };
      
      supabase
        .from("site_config")
        .upsert(row)
        .then(({ error }: any) => {
          if (error) console.error("Error seeding config setup to Supabase:", error.message);
          else console.log("Successfully synchronized startup site-config.json to Supabase (VIP Price R$ 7,50).");
        });
    } catch (e: any) {
      console.error("Failed startup site-config sync to Supabase:", e.message);
    }
  }

  // Ensure we start without mock VIP members
  let isMockVip = false;
  if (fs.existsSync(VIP_MEMBERS_FILE)) {
    try {
      const data = fs.readFileSync(VIP_MEMBERS_FILE, "utf-8");
      if (data.includes("Marco Latapiat") || data.includes("Gabriel Souza")) {
        isMockVip = true;
      }
    } catch {}
  }
  if (isMockVip || !fs.existsSync(VIP_MEMBERS_FILE)) {
    fs.writeFileSync(VIP_MEMBERS_FILE, "[]", "utf-8");
    console.log("Initialized vip-members.json as empty.");
  }

  // Ensure we start without mock coupons
  let isMockCoupons = false;
  if (fs.existsSync(COUPONS_FILE)) {
    try {
      const data = fs.readFileSync(COUPONS_FILE, "utf-8");
      if (data.includes("WEST10") || data.includes("VIPWEST")) {
        isMockCoupons = true;
      }
    } catch {}
  }
  if (isMockCoupons || !fs.existsSync(COUPONS_FILE)) {
    fs.writeFileSync(COUPONS_FILE, "[]", "utf-8");
    console.log("Initialized coupons.json as empty.");
  }

  // Ensure we start without mock orders
  let isMockOrders = false;
  if (fs.existsSync(ORDERS_FILE)) {
    try {
      const data = fs.readFileSync(ORDERS_FILE, "utf-8");
      if (data.includes("WS-ORDER-101") || data.includes("Carlos Silva")) {
        isMockOrders = true;
      }
    } catch {}
  }
  if (isMockOrders || !fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, "[]", "utf-8");
    console.log("Initialized orders.json as empty.");
  }

  // Ensure we start without mock reviews
  let isMockReviews = false;
  if (fs.existsSync(REVIEWS_FILE)) {
    try {
      const data = fs.readFileSync(REVIEWS_FILE, "utf-8");
      if (data.includes("rev-spfc-001")) {
        isMockReviews = true;
      }
    } catch {}
  }
  if (isMockReviews || !fs.existsSync(REVIEWS_FILE)) {
    fs.writeFileSync(REVIEWS_FILE, "[]", "utf-8");
    console.log("Initialized reviews.json as empty.");
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

// 8. ORDERS ENDPOINTS & ANALYTICS MANAGER
app.get("/api/orders", (req, res) => {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, "utf-8");
      return res.json(JSON.parse(data));
    }
    return res.json([]);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao carregar pedidos", details: err.message });
  }
});

app.post("/api/orders", (req, res) => {
  try {
    const order = req.body;
    if (!order || !order.clientName || !order.items) {
      return res.status(400).json({ error: "Dados do pedido incorretos" });
    }
    
    let orders = [];
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, "utf-8");
      orders = JSON.parse(data);
    }
    
    // Auto increment / ID builder
    const newId = `WS-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      ...order,
      id: order.id || newId,
      date: new Date().toISOString()
    };
    
    orders.unshift(newOrder);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
    
    // Also, update popularity metrics & deduct stock for the items purchased!
    try {
      if (fs.existsSync(CATALOG_FILE)) {
        const catData = fs.readFileSync(CATALOG_FILE, "utf-8");
        const catalog = JSON.parse(catData);
        order.items.forEach((item: any) => {
          const match = catalog.find((jk: any) => jk.id === item.kitId);
          if (match) {
            match.popularity = (match.popularity || 0) + (item.quantity || 1);
            if (match.stock && match.stock[item.size] !== undefined) {
              match.stock[item.size] = Math.max(0, match.stock[item.size] - (item.quantity || 1));
            }
          }
        });
        fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2), "utf-8");
      }
    } catch (e) {
      console.warn("Stock deduction warning:", e);
    }

    res.json({ success: true, order: newOrder });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao registrar pedido", details: err.message });
  }
});

app.post("/api/orders/update-status", (req, res) => {
  const adminPasswordHeader = req.headers["x-admin-password"];
  const expectedPassword = getServerAdminPassword();
  if (adminPasswordHeader !== expectedPassword) {
    return res.status(403).json({ error: "Não autorizado." });
  }

  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ error: "Parâmetros incorretos" });
    }
    
    let orders = [];
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, "utf-8");
      orders = JSON.parse(data);
    }
    
    const idx = orders.findIndex((o: any) => o.id === orderId);
    if (idx === -1) {
      return res.status(404).json({ error: "Pedido não localizado" });
    }
    
    orders[idx].status = status;
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
    res.json({ success: true, message: "Status atualizado com sucesso!" });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao atualizar status do pedido", details: err.message });
  }
});

app.post("/api/orders/delete", (req, res) => {
  const adminPasswordHeader = req.headers["x-admin-password"];
  const expectedPassword = getServerAdminPassword();
  if (adminPasswordHeader !== expectedPassword) {
    return res.status(403).json({ error: "Não autorizado." });
  }

  try {
    const { orderId } = req.body;
    let orders = [];
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, "utf-8");
      orders = JSON.parse(data);
    }
    
    const filtered = orders.filter((o: any) => o.id !== orderId);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    res.json({ success: true, message: "Pedido deletado com sucesso!" });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao deletar pedido", details: err.message });
  }
});

// 9. CLIENT INTERACTIVE REVIEWS ENDPOINTS
app.get("/api/reviews", (req, res) => {
  try {
    if (fs.existsSync(REVIEWS_FILE)) {
      const data = fs.readFileSync(REVIEWS_FILE, "utf-8");
      return res.json(JSON.parse(data));
    }
    return res.json([]);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao ler avaliações", details: err.message });
  }
});

app.post("/api/reviews", (req, res) => {
  try {
    const review = req.body;
    if (!review || !review.clientName || !review.rating || !review.text) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
    }
    
    let reviews = [];
    if (fs.existsSync(REVIEWS_FILE)) {
      const data = fs.readFileSync(REVIEWS_FILE, "utf-8");
      reviews = JSON.parse(data);
    }
    
    const newId = `rev-${Date.now()}`;
    const newReview = {
      id: newId,
      jerseyId: review.jerseyId || null,
      jerseyName: review.jerseyName || null,
      clientName: review.clientName,
      rating: Number(review.rating),
      text: review.text,
      date: new Date().toISOString().split("T")[0],
      imageUrl: review.imageUrl || null,
      approved: false, // Moderate by default before highlighting
      featured: false
    };
    
    reviews.unshift(newReview);
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");
    res.json({ success: true, review: newReview, message: "Avaliação enviada para moderação da West Store!" });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao enviar avaliação", details: err.message });
  }
});

app.post("/api/reviews/moderate", (req, res) => {
  const adminPasswordHeader = req.headers["x-admin-password"];
  const expectedPassword = getServerAdminPassword();
  if (adminPasswordHeader !== expectedPassword) {
    return res.status(403).json({ error: "Não autorizado." });
  }
  
  try {
    const { reviewId, approved } = req.body;
    let reviews = [];
    if (fs.existsSync(REVIEWS_FILE)) {
      const data = fs.readFileSync(REVIEWS_FILE, "utf-8");
      reviews = JSON.parse(data);
    }
    
    const idx = reviews.findIndex((r: any) => r.id === reviewId);
    if (idx !== -1) {
      reviews[idx].approved = approved;
      fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");
      res.json({ success: true, message: approved ? "Avaliação aprovada do cliente!" : "Avaliação desaprovada!" });
    } else {
      res.status(404).json({ error: "Avaliação não encontrada" });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Erro na moderação", details: err.message });
  }
});

app.post("/api/reviews/feature", (req, res) => {
  const adminPasswordHeader = req.headers["x-admin-password"];
  const expectedPassword = getServerAdminPassword();
  if (adminPasswordHeader !== expectedPassword) {
    return res.status(403).json({ error: "Não autorizado." });
  }
  
  try {
    const { reviewId, featured } = req.body;
    let reviews = [];
    if (fs.existsSync(REVIEWS_FILE)) {
      const data = fs.readFileSync(REVIEWS_FILE, "utf-8");
      reviews = JSON.parse(data);
    }
    
    const idx = reviews.findIndex((r: any) => r.id === reviewId);
    if (idx !== -1) {
      reviews[idx].featured = featured;
      fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");
      res.json({ success: true, message: featured ? "Destacada com sucesso na vitrine principal!" : "Removida dos destaques!" });
    } else {
      res.status(404).json({ error: "Avaliação não encontrada" });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao destacar", details: err.message });
  }
});

app.post("/api/reviews/delete", (req, res) => {
  const adminPasswordHeader = req.headers["x-admin-password"];
  const expectedPassword = getServerAdminPassword();
  if (adminPasswordHeader !== expectedPassword) {
    return res.status(403).json({ error: "Não autorizado." });
  }
  
  try {
    const { reviewId } = req.body;
    let reviews = [];
    if (fs.existsSync(REVIEWS_FILE)) {
      const data = fs.readFileSync(REVIEWS_FILE, "utf-8");
      reviews = JSON.parse(data);
    }
    
    const filtered = reviews.filter((r: any) => r.id !== reviewId);
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    res.json({ success: true, message: "Avaliação removida com sucesso!" });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao remover avaliação", details: err.message });
  }
});

// 10. GRID TENDENCIAS FOOTBALL ENGINE - INCREMENT PRODUCT DETAIL CLICK VIEWS
app.post("/api/catalog/view/:id", (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID inválido" });
    
    if (fs.existsSync(CATALOG_FILE)) {
      const data = fs.readFileSync(CATALOG_FILE, "utf-8");
      const catalog = JSON.parse(data);
      const match = catalog.find((c: any) => c.id === id);
      if (match) {
        match.views = (match.views || 0) + 1;
        fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2), "utf-8");
        return res.json({ success: true, views: match.views });
      }
    }
    res.json({ success: false, message: "Produto não encontrado" });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao computar visualização", details: err.message });
  }
});

// 11. SECURE DATABASE PURGE ALL (RESET ENGINES)
app.post("/api/admin/purge-all", (req, res) => {
  const adminPasswordHeader = req.headers["x-admin-password"];
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";
  if (adminPasswordHeader !== expectedPassword) {
    return res.status(403).json({ error: "Não autorizado." });
  }

  try {
    fs.writeFileSync(CATALOG_FILE, JSON.stringify([], null, 2), "utf-8");
    fs.writeFileSync(VIP_MEMBERS_FILE, JSON.stringify([], null, 2), "utf-8");
    fs.writeFileSync(COUPONS_FILE, JSON.stringify([], null, 2), "utf-8");
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), "utf-8");
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify([], null, 2), "utf-8");

    res.json({ success: true, message: "Todos os produtos foram removidos e a dashboard foi zerada com sucesso!" });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao zerar dados locais", details: err.message });
  }
});

// VITE MIDDLEWARE INTERACTION FOR DEV vs PROD SERVICE
async function mountViteMiddleware() {
  if (process.env.VERCEL) {
    console.log("Running in Vercel Serverless environment. Skipping Vite middleware and local listen.");
    return;
  }

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

export default app;
