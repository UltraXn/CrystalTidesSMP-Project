import React, { useEffect, useState, useMemo } from "react";
import Section from "../components/Layout/Section";
import {
  Info,
  ShieldCheck,
  MessageSquare,
  Swords,
  Trees,
  Palette,
  Video,
  Scale,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Save,
  Gavel,
  X,
  UserRound,
  Globe,
  Users,
  Loader2,
  Languages,
  Search,
} from "lucide-react";
import { gsap } from "gsap";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import {
  getRules,
  createRule,
  updateRule,
  deleteRule,
  Rule,
} from "../services/ruleService";
import { supabase } from "../services/supabaseClient";
import Loader from "../components/UI/Loader";
import { m as motion, AnimatePresence } from "framer-motion";
import { useSEO } from "../hooks/useSEO";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// Icon mapping based on Category - Enhanced for beauty
const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string }
> = {
  General: { icon: <Info size={18} />, color: "#6366f1" }, // Indigo
  Comportamiento: { icon: <ShieldCheck size={18} />, color: "#f87171" }, // Red
  Chat: { icon: <MessageSquare size={18} />, color: "#4ade80" }, // Green
  PvP: { icon: <Swords size={18} />, color: "#fb923c" }, // Orange
  Construcción: { icon: <Trees size={18} />, color: "#2dd4bf" }, // Teal
  Modificaciones: { icon: <Palette size={18} />, color: "#a78bfa" }, // Purple
  Staff: { icon: <Scale size={18} />, color: "#f472b6" }, // Pink
  Seguridad: { icon: <Shield size={18} />, color: "#10b981" }, // Emerald
  Contenido: { icon: <Video size={18} />, color: "#fcd34d" }, // Amber
  Economía: { icon: <Scale size={18} />, color: "#34d399" }, // Emerald
  Mundo: { icon: <Globe size={18} />, color: "#60a5fa" }, // Blue
  Cuenta: { icon: <UserRound size={18} />, color: "#94a3b8" }, // Gray
  Discord: {
    icon: (
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 640 512"
        height="18"
        width="18"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.8,167.234,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
      </svg>
    ),
    color: "#5865F2",
  }, // Discord Blue
  Estética: { icon: <Palette size={18} />, color: "#f472b6" }, // Pink/Rose
  Comunidad: { icon: <Users size={18} />, color: "#fb7185" }, // Rose/Coral
};

const DEFAULT_ICON_CONFIG = { icon: <Gavel size={18} />, color: "#94a3b8" };

// Helper to get rule severity
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getRuleSeverity = (category: string, title: string, t: any) => {
  const cat = (category || "").toLowerCase();
  const ttl = title.toLowerCase();
  if (
    cat === "seguridad" ||
    cat === "security" ||
    ttl.includes("hack") ||
    ttl.includes("dupe") ||
    ttl.includes("exploit") ||
    ttl.includes("robo") ||
    ttl.includes("cuenta")
  ) {
    return {
      label: t("rules.severity.critical", "Crítica"),
      color: "#ef4444",
      class: "bg-red-500/10 text-red-400 border-red-500/20",
    };
  }
  if (
    cat === "pvp" ||
    cat === "construcción" ||
    cat === "building" ||
    ttl.includes("grifo") ||
    ttl.includes("grief") ||
    ttl.includes("insulto") ||
    ttl.includes("comportamiento")
  ) {
    return {
      label: t("rules.severity.serious", "Grave"),
      color: "#f97316",
      class: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    };
  }
  return {
    label: t("rules.severity.mild", "Leve"),
    color: "#10b981",
    class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
};

// Helper to get rule examples
const getRuleExamples = (
  category: string,
  _title: string,
  lang: string = "es",
) => {
  const cat = (category || "").toLowerCase();

  if (cat === "chat") {
    return lang === "en"
      ? {
          allowed:
            "Greeting, respectful debate, trading via global chat, and wholesome jokes.",
          forbidden:
            "Spam, insults, toxicity, sharing unauthorized links, discrimination, or excessive caps.",
        }
      : {
          allowed:
            "Saludar, debatir con respeto, comerciar por el chat global y compartir chistes sanos.",
          forbidden:
            "Spam, insultos, toxicidad, compartir enlaces no autorizados, discriminación o mayúsculas excesivas.",
        };
  }
  if (cat === "pvp") {
    return lang === "en"
      ? {
          allowed: "Fighting in designated zones, declaring formal clan wars.",
          forbidden: "Spawnkilling, combat logging, or lava trapping.",
        }
      : {
          allowed:
            "Pelear en zonas habilitadas, declarar guerras formales bajo el sistema de clanes.",
          forbidden:
            "Matar reiteradamente en puntos de aparición (spawnkill), usar desconexión en combate o trampas de lava.",
        };
  }
  if (cat === "construcción" || cat === "building") {
    return lang === "en"
      ? {
          allowed:
            "Creating claims, building towns with friends, decorating public pathways aesthetically.",
          forbidden:
            "Griefing, constructing ugly floating structures, blocking access for other players.",
        }
      : {
          allowed:
            "Crear reclamos (claims), edificar ciudades con amigos, decorar caminos públicos de forma estética.",
          forbidden:
            "Griefing (destrucción), construir estructuras flotantes sin estética, tapar accesos de otros jugadores.",
        };
  }
  if (cat === "seguridad" || cat === "security") {
    return lang === "en"
      ? {
          allowed:
            "Reporting bugs and exploits in Discord private support channel.",
          forbidden:
            "Using hacks, dupes, exploiting bugs, sharing accounts, or stealing unprotected chests.",
        }
      : {
          allowed:
            "Reportar fallos y exploits en el canal de soporte privado de Discord.",
          forbidden:
            "Uso de hacks, dupes, aprovechamiento de bugs, compartir cuentas personales o robo de cofres desprotegidos.",
        };
  }
  return lang === "en"
    ? {
        allowed:
          "Play fairly, respect staff instructions, and enjoy the CrystalTides experience.",
        forbidden:
          "Evading punishments using alt accounts, abusing game mechanics to harass others.",
      }
    : {
        allowed:
          "Jugar justamente, respetar las indicaciones del staff y disfrutar de la experiencia CrystalTides.",
        forbidden:
          "Intentar evadir sanciones mediante multicuentas, abusar de mecánicas del juego para molestar a otros.",
      };
};

// Helper to get related commands matching each category
const getRuleCommands = (category: string) => {
  const cat = (category || "").toLowerCase().trim();
  if (cat === "chat") {
    return ["/ignore <jugador>", "/msg <jugador>", "/report <jugador>"];
  }
  if (cat === "pvp" || cat === "combate") {
    return ["/duelo retar <jugador>", "/duelo aceptar", "/pvp toggle"];
  }
  if (
    cat === "construcción" ||
    cat === "construccion" ||
    cat === "building" ||
    cat === "claims"
  ) {
    return ["/lands claim", "/trust <jugador>"];
  }
  if (cat === "seguridad" || cat === "security" || cat === "cuenta") {
    return ["/link <code>", "/unlink", "/report <jugador>"];
  }
  if (cat === "economía" || cat === "economia" || cat === "economy") {
    return ["/money", "/bal", "/banco"];
  }
  return ["/help", "/rules", "/report <jugador>"];
};

export default function Rules() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  useSEO({
    title: "Reglamento Oficial y Normas de Convivencia",
    description:
      "Consulta el reglamento oficial de CrystalTides SMP 1.21+. Normas sobre PvP, construcciones, fair play y convivencia comunitaria.",
    keywords:
      "reglas minecraft, reglamento smp, normas servidor minecraft, fair play minecraft, pvp reglas",
    canonical: "https://crystaltidessmp.net/rules",
  });
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRuleId, setExpandedRuleId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin State
  const [isEditing, setIsEditing] = useState(false);
  const [editRuleId, setEditRuleId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Rule>>({
    category: "General",
    title: "",
    title_en: "",
    content: "",
    content_en: "",
    color: "",
    sort_order: 0,
  });
  const [translating, setTranslating] = useState<string | null>(null);

  const allowedRoles = ["admin", "developer", "neroferno", "killu", "helper"];
  const isStaff = allowedRoles.includes(
    user?.user_metadata?.role?.toLowerCase() || "",
  );

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await getRules();
      setRules(data);
    } catch (err) {
      console.error("Failed to load rules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // Process rules: Global Sort & Indexing
  const processedRules = useMemo(() => {
    const sorted = [...rules].sort((a, b) => {
      if ((a.sort_order || 0) !== (b.sort_order || 0)) {
        return (a.sort_order || 0) - (b.sort_order || 0);
      }
      return (a.category || "").localeCompare(b.category || "");
    });

    return sorted.map((rule, idx) => ({
      ...rule,
      globalIndex: idx + 1,
    }));
  }, [rules]);

  const filteredRules = useMemo(() => {
    let result = processedRules;
    if (activeFilter) {
      result = result.filter((r) => r.category === activeFilter);
    }
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(term) ||
          Boolean(r.title_en?.toLowerCase().includes(term)) ||
          r.content.toLowerCase().includes(term) ||
          Boolean(r.content_en?.toLowerCase().includes(term)) ||
          (r.category || "").toLowerCase().includes(term),
      );
    }
    return result;
  }, [processedRules, activeFilter, searchTerm]);

  const handleTranslate = async (
    text: string,
    toLang: "es" | "en",
    field: "title" | "content" | "title_en" | "content_en",
  ) => {
    if (!text) return;
    setTranslating(field);
    try {
      const token = (await supabase.auth.getSession()).data.session
        ?.access_token;
      const res = await fetch(`${API_URL}/translation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, targetLang: toLang }),
      });
      if (!res.ok) throw new Error("Translation failed");
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, [field]: data.translatedText }));
      }
    } catch (error) {
      console.error("Translation fail", error);
    } finally {
      setTranslating(null);
    }
  };

  // UI Animations
  useEffect(() => {
    if (filteredRules.length === 0) return;

    gsap.fromTo(
      ".rule-card-premium",
      { opacity: 0, scale: 0.95, y: 30 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        stagger: 0.05,
        duration: 0.5,
        ease: "power3.out",
        clearProps: "transform,opacity",
      },
    );
  }, [filteredRules]);

  const handleSave = async () => {
    if (!user) return;
    try {
      const token = (await supabase.auth.getSession()).data.session
        ?.access_token;
      if (!token) throw new Error("No token");

      if (editRuleId) {
        await updateRule(editRuleId, formData, token);
      } else {
        await createRule(formData as Omit<Rule, "id">, token);
      }

      setFormData({
        category: "General",
        title: "",
        title_en: "",
        content: "",
        content_en: "",
        color: "",
        sort_order: 0,
      });
      setEditRuleId(null);
      setIsEditing(false);
      fetchRules();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert("Error al guardar: " + msg);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        t("common.confirm_delete", "¿Seguro que quieres borrar este elemento?"),
      )
    )
      return;
    if (!user) return;
    try {
      const token = (await supabase.auth.getSession()).data.session
        ?.access_token;
      if (!token) throw new Error("No token");

      await deleteRule(id, token);
      fetchRules();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(t("rules.delete_error", "Error al borrar") + ": " + msg);
    }
  };

  const startEdit = (rule: Rule) => {
    setFormData(rule);
    setEditRuleId(rule.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const categories = Array.from(
    new Set(rules.map((r) => r.category || "General")),
  );

  let rulesContent: React.ReactNode = null;
  if (loading) {
    rulesContent = (
      <div className="py-20">
        <Loader text={t("rules.loading") || "Cargando normativas..."} />
      </div>
    );
  } else if (filteredRules.length === 0) {
    rulesContent = (
      <div className="py-20 text-center text-sm font-bold uppercase tracking-widest text-gray-500">
        No se encontraron normas para tu búsqueda.
      </div>
    );
  } else {
    rulesContent = (
      <div className="mx-auto grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredRules.map((rule) => {
          const config =
            CATEGORY_CONFIG[rule.category || "General"] || DEFAULT_ICON_CONFIG;
          const accent = rule.color || config.color;
          const isExpanded = expandedRuleId === rule.id;
          const severity = getRuleSeverity(
            rule.category || "General",
            rule.title,
            t,
          );
          const examples = getRuleExamples(
            rule.category || "General",
            rule.title,
            i18n.language,
          );
          const commands = getRuleCommands(rule.category || "General");
          const displayTitle =
            i18n.language === "en" && rule.title_en
              ? rule.title_en
              : rule.title;
          const displayContent =
            i18n.language === "en" && rule.content_en
              ? rule.content_en
              : rule.content;

          return (
            <article
              key={rule.id}
              className={`rule-card-premium group relative flex h-full w-full flex-col gap-6 overflow-hidden rounded-3xl border bg-black/60 p-8 text-left backdrop-blur-xl transition-colors duration-300 hover:-translate-y-1 hover:shadow-2xl ${isExpanded ? "border-(--accent)/50 shadow-(--accent)/5 shadow-2xl" : "hover:border-(--accent)/30 border-white/5"}`}
            >
              <button
                type="button"
                aria-label={isExpanded ? "Colapsar regla" : "Expandir regla"}
                aria-expanded={isExpanded}
                onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                className="absolute inset-0 z-10 cursor-pointer"
              />
              <div className="pointer-events-none absolute right-8 top-8 select-none font-sans text-5xl font-black text-white/5 transition-colors group-hover:scale-110 group-hover:text-white/10">
                #{String(rule.globalIndex).padStart(2, "0")}
              </div>

              {isStaff && (
                <div className="absolute right-20 top-4 z-20 flex gap-2 opacity-0 transition-colors group-hover:opacity-100">
                  <button
                    aria-label={t("common.edit", "Editar")}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(rule);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 transition-colors hover:bg-emerald-500 hover:text-black"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    aria-label={t("common.delete", "Eliminar")}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(rule.id);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-500 transition-colors hover:bg-red-500 hover:text-black"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em]"
                  style={{ color: accent }}
                >
                  <span className="group-hover:scale-115 text-lg transition-transform duration-300 group-hover:rotate-12">
                    {config.icon}
                  </span>
                  <span>
                    {t(
                      `rules.categories.${(rule.category || "General").toLowerCase()}`,
                      rule.category || "General",
                    )}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${severity.class}`}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                    style={{ backgroundColor: severity.color }}
                  ></span>
                  {severity.label}
                </div>
              </div>

              <h3 className="group-hover:text-(--accent) m-0 text-2xl font-black leading-tight text-white transition-colors">
                {displayTitle}
              </h3>

              <div className="grow text-sm font-medium leading-relaxed text-gray-400">
                {displayContent}
              </div>

              {/* Expandable Section */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="flex flex-col gap-5 overflow-hidden border-t border-white/5 pt-6 text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Examples */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4">
                        <div className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                          {t("rules.allowed", "PERMITIDO")}
                        </div>
                        <div className="text-xs font-medium leading-relaxed text-gray-300">
                          {examples.allowed}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-4">
                        <div className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-red-400">
                          {t("rules.forbidden", "PROHIBIDO / SANCIONABLE")}
                        </div>
                        <div className="text-xs font-medium leading-relaxed text-gray-300">
                          {examples.forbidden}
                        </div>
                      </div>
                    </div>

                    {/* Commands */}
                    {commands && commands.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <div className="ml-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                          {t("rules.useful_commands", "COMANDOS ÚTILES")}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {commands.map((cmd) => (
                            <button
                              type="button"
                              key={cmd}
                              onClick={() => {
                                navigator.clipboard.writeText(cmd);
                                showToast(
                                  `${t("rules.copied", "Copiado al portapapeles:")} ${cmd}`,
                                );
                              }}
                              className="hover:bg-(--accent)/15 hover:border-(--accent)/30 hover:text-(--accent) group/cmd flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-gray-300 transition-colors"
                            >
                              <span>{cmd}</span>
                              <span className="text-[9px] opacity-30 transition-opacity group-hover/cmd:opacity-100">
                                ({t("common.copy", "Copiar")})
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-6">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xl transition-colors group-hover:-rotate-12 group-hover:scale-110"
                  style={{ color: accent }}
                >
                  {config.icon}
                </div>
                <div className="group-hover:text-(--accent) text-[10px] font-black uppercase tracking-widest text-gray-500 transition-colors">
                  {isExpanded
                    ? t("rules.view_less", "Ver menos ↑")
                    : t("rules.view_more", "Ver detalles ↓")}
                </div>
              </div>

              {/* Accent Bar */}
              <div
                className="absolute bottom-0 left-0 top-0 w-1"
                style={{ backgroundColor: accent }}
              ></div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <Section
        title={t("rules.title") || "Normas del Servidor"}
        headingLevel="h1"
      >
        <div className="relative z-10 flex w-full flex-col items-center pb-20">
          {/* Header Section */}
          <div className="mx-auto mb-12 w-full max-w-5xl space-y-6 text-center">
            <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-400 md:text-lg">
              {t("rules.intro") ||
                "Para mantener una comunidad sana y divertida, es fundamental respetar estas normas de convivencia. El incumplimiento puede llevar a sanciones severas."}
            </p>

            {/* Search Bar */}
            <div className="group relative mx-auto w-full max-w-2xl">
              <Search
                className="group-focus-within:text-(--accent) absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
                size={20}
              />
              <input
                aria-label="Input field"
                type="text"
                placeholder={t(
                  "rules.search_placeholder",
                  "Buscar normas... (ej: pvp, chat, insultos)",
                )}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setExpandedRuleId(null);
                }}
                className="pl-13 focus:border-(--accent) focus:ring-(--accent)/20 w-full rounded-2xl border border-white/15 bg-black/60 py-4 pr-12 text-base text-white shadow-2xl backdrop-blur-xl transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2"
              />
              {searchTerm && (
                <button
                  aria-label="Action"
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Filter Bar */}
            <div className="relative mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/50 p-2 shadow-2xl backdrop-blur-2xl">
              <button
                type="button"
                onClick={() => {
                  setActiveFilter(null);
                  setExpandedRuleId(null);
                }}
                className={`relative z-10 flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors duration-300 ${!activeFilter ? "font-black text-black" : "text-gray-400 hover:text-white"}`}
              >
                {!activeFilter && (
                  <motion.div
                    layoutId="activeCategoryBg"
                    className="bg-(--accent) shadow-(--accent)/30 absolute inset-0 -z-10 rounded-xl shadow-lg"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Scale size={15} /> {t("rules.all", "Todas")}
              </button>
              {categories.map((cat) => {
                const config = CATEGORY_CONFIG[cat] || DEFAULT_ICON_CONFIG;
                const isActive = activeFilter === cat;
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => {
                      setActiveFilter(cat);
                      setExpandedRuleId(null);
                    }}
                    className={`relative z-10 flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors duration-300 ${isActive ? "font-black text-black" : "text-gray-400 hover:text-white"}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryBg"
                        className="bg-(--accent) shadow-(--accent)/30 absolute inset-0 -z-10 rounded-xl shadow-lg"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    {config.icon}{" "}
                    {t(`rules.categories.${cat.toLowerCase()}`, cat)}
                  </button>
                );
              })}
            </div>

            {isStaff && !isEditing && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setEditRuleId(null);
                    setFormData({
                      category: "General",
                      title: "",
                      title_en: "",
                      content: "",
                      content_en: "",
                      color: "",
                      sort_order: 0,
                    });
                  }}
                  className="hover:bg-(--accent) cursor-pointer rounded-full bg-white px-8 py-3.5 text-xs font-black uppercase tracking-widest text-black shadow-xl transition-colors hover:scale-105"
                >
                  <Plus className="mr-2 inline" size={16} />{" "}
                  {t("rules.new_rule", "Nueva Normativa")}
                </button>
              </div>
            )}
          </div>

          {/* Admin Editor Form */}
          {isEditing && (
            <div className="mx-auto mb-20 w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl backdrop-blur-3xl">
              <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-6">
                <h3 className="text-(--accent) text-2xl font-black uppercase tracking-widest">
                  {editRuleId
                    ? t("rules.editing", "Editando Norma")
                    : t("rules.new_norm", "Nueva Norma")}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase text-white/50 transition-colors hover:text-white"
                >
                  <X size={14} /> {t("rules.close", "Cerrar")}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-8 text-left md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="rules-category"
                    className="ml-4 text-[10px] font-black uppercase tracking-widest text-gray-500"
                  >
                    {t("rules.category", "Categoría")}
                  </label>
                  <input
                    id="rules-category"
                    type="text"
                    list="category-suggestions"
                    className="focus:border-(--accent) rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white transition-colors focus:outline-none"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder={t(
                      "rules.cat_placeholder",
                      "Ej: PvP, Chat, Construcción...",
                    )}
                  />
                  <datalist id="category-suggestions">
                    {Object.keys(CATEGORY_CONFIG).map((c) => (
                      <option key={c} value={c} label={c}>
                        {c}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="rules-sort-order"
                    className="ml-4 text-[10px] font-black uppercase tracking-widest text-gray-500"
                  >
                    {t("rules.sort_order", "Orden de Visualización")}
                  </label>
                  <input
                    id="rules-sort-order"
                    type="number"
                    className="focus:border-(--accent) rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white transition-colors focus:outline-none"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sort_order: Number.parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <div className="flex items-center justify-between px-4">
                    <label
                      htmlFor="rules-title-es"
                      className="text-[10px] font-black uppercase tracking-widest text-gray-500"
                    >
                      {t("rules.title_es", "Título (Español)")}
                    </label>
                    <button
                      type="button"
                      className="bg-(--accent)/10 text-(--accent) border-(--accent)/20 hover:bg-(--accent) rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-colors hover:text-black disabled:opacity-50"
                      onClick={() =>
                        handleTranslate(formData.title || "", "en", "title_en")
                      }
                      disabled={!!translating || !formData.title}
                    >
                      {translating === "title_en" ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Languages className="mr-1 inline" size={14} />
                      )}{" "}
                      {t("rules.translate_to_en", "Traducir a EN")}
                    </button>
                  </div>
                  <input
                    id="rules-title-es"
                    type="text"
                    className="focus:border-(--accent) rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white transition-colors focus:outline-none"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder={t(
                      "rules.title_placeholder_es",
                      "Título en español",
                    )}
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <div className="flex items-center justify-between px-4">
                    <label
                      htmlFor="rules-title-en"
                      className="text-[10px] font-black uppercase tracking-widest text-gray-500"
                    >
                      {t("rules.title_en", "Título (Inglés)")}{" "}
                      <span className="opacity-40">
                        ({t("common.optional", "Opcional")})
                      </span>
                    </label>
                    <button
                      type="button"
                      className="bg-(--accent)/10 text-(--accent) border-(--accent)/20 hover:bg-(--accent) rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-colors hover:text-black disabled:opacity-50"
                      onClick={() =>
                        handleTranslate(formData.title_en || "", "es", "title")
                      }
                      disabled={!!translating || !formData.title_en}
                    >
                      {translating === "title" ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Languages className="mr-1 inline" size={14} />
                      )}{" "}
                      {t("rules.translate_to_es", "Traducir a ES")}
                    </button>
                  </div>
                  <input
                    id="rules-title-en"
                    type="text"
                    className="focus:border-(--accent) rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white transition-colors focus:outline-none"
                    value={formData.title_en}
                    onChange={(e) =>
                      setFormData({ ...formData, title_en: e.target.value })
                    }
                    placeholder={t(
                      "rules.title_placeholder_en",
                      "English title",
                    )}
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <div className="flex items-center justify-between px-4">
                    <label
                      htmlFor="rules-content-es"
                      className="text-[10px] font-black uppercase tracking-widest text-gray-500"
                    >
                      {t("rules.content_es", "Contenido (Español)")}
                    </label>
                    <button
                      type="button"
                      className="bg-(--accent)/10 text-(--accent) border-(--accent)/20 hover:bg-(--accent) rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-colors hover:text-black disabled:opacity-50"
                      onClick={() =>
                        handleTranslate(
                          formData.content || "",
                          "en",
                          "content_en",
                        )
                      }
                      disabled={!!translating || !formData.content}
                    >
                      {translating === "content_en" ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Languages className="mr-1 inline" size={14} />
                      )}{" "}
                      {t("rules.translate_to_en", "Traducir a EN")}
                    </button>
                  </div>
                  <textarea
                    id="rules-content-es"
                    rows={4}
                    className="focus:border-(--accent) resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white transition-colors focus:outline-none"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder={t(
                      "rules.content_placeholder_es",
                      "Contenido en español...",
                    )}
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <div className="flex items-center justify-between px-4">
                    <label
                      htmlFor="rules-content-en"
                      className="text-[10px] font-black uppercase tracking-widest text-gray-500"
                    >
                      {t("rules.content_en", "Contenido (Inglés)")}{" "}
                      <span className="opacity-40">
                        ({t("common.optional", "Opcional")})
                      </span>
                    </label>
                    <button
                      type="button"
                      className="bg-(--accent)/10 text-(--accent) border-(--accent)/20 hover:bg-(--accent) rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-colors hover:text-black disabled:opacity-50"
                      onClick={() =>
                        handleTranslate(
                          formData.content_en || "",
                          "es",
                          "content",
                        )
                      }
                      disabled={!!translating || !formData.content_en}
                    >
                      {translating === "content" ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Languages className="mr-1 inline" size={14} />
                      )}{" "}
                      {t("rules.translate_to_es", "Traducir a ES")}
                    </button>
                  </div>
                  <textarea
                    id="rules-content-en"
                    rows={4}
                    className="focus:border-(--accent) resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white transition-colors focus:outline-none"
                    value={formData.content_en}
                    onChange={(e) =>
                      setFormData({ ...formData, content_en: e.target.value })
                    }
                    placeholder={t(
                      "rules.content_placeholder_en",
                      "English content...",
                    )}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-(--accent) shadow-(--accent)/20 mt-4 rounded-2xl py-5 font-black uppercase tracking-widest text-black shadow-lg transition-colors hover:scale-[1.02] active:scale-95 disabled:opacity-50 md:col-span-2"
                  disabled={!!translating}
                >
                  <Save className="mr-2 inline" size={18} />{" "}
                  {editRuleId
                    ? t("rules.update_btn", "ACTUALIZAR NORMA")
                    : t("rules.publish_btn", "PUBLICAR NORMA")}
                </button>
              </div>
            </div>
          )}

          {rulesContent}
        </div>
      </Section>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="z-1000 border-(--accent)/30 fixed bottom-10 right-10 flex items-center gap-3 rounded-2xl border bg-black/90 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-2xl backdrop-blur-md"
          >
            <span className="bg-(--accent) h-2.5 w-2.5 animate-ping rounded-full"></span>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decorations */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="w-150 h-150 absolute -right-[5%] top-[20%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
        <div className="w-125 h-125 bg-(--accent)/5 absolute -left-[5%] bottom-[10%] rounded-full blur-[100px]"></div>
      </div>
    </>
  );
}
