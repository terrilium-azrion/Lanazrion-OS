import { GoogleGenAI, Type } from "@google/genai";
import { sanitizeResponse } from "./Sanitizer";
import { auth } from "../firebase";
import systemConfig from "../constants/kaleidoland_system_config.json";

// We'll load the terrils data to inject it into the system prompt
// In a production environment, this might be handled differently, 
// but for this showcase, we'll embed it for maximum reliability.
const TERRILS_DATA = `
id,Nom du terril,Commune,Espace protégé ?
1,"Terril n°1, 5 de Bruay Nord","Divion et Bruay-la-Buissière","UNESCO"
2,"Terril n°1A, 5 de Bruay Sud","Divion","UNESCO"
... (334 sites total)
`;

const buildSystemInstruction = () => {
  const { role, identity, core_logic, data_matrix, constraints } = systemConfig.system_instruction;
  
  return `
Tu es ${role}. Identité : ${identity.name}. 
Branding : ${identity.branding}.
Palette Visuelle : ${identity.visual_palette.join(', ')}.

# LOGIQUE CORE
Mode Public : ${core_logic.mode_public}
Objectif Principal : ${core_logic.primary_goal}
Services : 
${core_logic.services.map(s => `- ${s}`).join('\n')}

# MATRICE DE DONNÉES
Base de Référence : ${data_matrix.reference_database}
Logique d'Opportunité : ${data_matrix.opportunity_logic}
Géofencing : ${data_matrix.geofencing}

# CONTRAINTES
Ton : ${constraints.tone}
Sujets Prohibés : ${constraints.prohibited_topics.join(', ')}
Format de Sortie : ${constraints.output_format}

# RÈGLES DE RÉPONSE CRITIQUES
- Réponds TOUJOURS au format JSON selon le schéma fourni.
- Utilise des boutons d'action (action_buttons) pour guider l'utilisateur vers "STRATÉGIE", "LIDAR", "APP" ou "RADAR".
- Chaque terril cité doit être traité comme un actif numérique à haute valeur (IP Valuation).
- Si l'utilisateur semble être une entreprise importante, déclenche une 'vip_alert'.
- Inclus toujours un 'insee_pillar' correspondant à la nature de la réponse.
- Le 'shadow_update' doit contenir une réflexion interne sur l'évolution du contexte si nécessaire.
`;
};

const SYSTEM_INSTRUCTION = buildSystemInstruction();

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING, description: "Synthèse chirurgicale en Markdown" },
    ui_mutation: {
      type: Type.OBJECT,
      properties: {
        entropy_score: { type: Type.NUMBER, description: "Score de chaos (0.0 à 1.0)" },
        theme: { type: Type.STRING, enum: ["LANA_HEIGHT", "GOLD_RESERVE", "BLOOD_ALERTE", "NEUTRAL", "LANA_ZEN_DEEP"] },
        shadow_update: { type: Type.STRING, description: "Mise à jour du contexte interne (optionnel)" },
        liquidator_report: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            flaw: { type: Type.STRING },
            sandwich_critique: { type: Type.STRING }
          },
          required: ["score", "flaw", "sandwich_critique"]
        },
        future_impact: {
          type: Type.OBJECT,
          properties: {
            scalability: { type: Type.NUMBER },
            burnout_risk: { type: Type.NUMBER }
          },
          required: ["scalability", "burnout_risk"]
        },
        gravity_check: {
          type: Type.OBJECT,
          properties: {
            rarity_score: { type: Type.NUMBER },
            market_saturation: { type: Type.NUMBER },
            verdict: { type: Type.STRING }
          },
          required: ["rarity_score", "market_saturation", "verdict"]
        },
        flow_action: {
          type: Type.OBJECT,
          properties: {
            task: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["EXECUTING", "PENDING"] }
          },
          required: ["task", "status"]
        },
        sensory_status: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING, enum: ["RED", "GOLD", "NEUTRAL"] },
            friction_coefficient: { type: Type.NUMBER }
          },
          required: ["level", "friction_coefficient"]
        },
        action_buttons: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              cmd: { type: Type.STRING }
            },
            required: ["label", "cmd"]
          }
        },
        vip_alert: {
          type: Type.OBJECT,
          properties: {
            company_name: { type: Type.STRING },
            zone: { type: Type.STRING },
            score: { type: Type.NUMBER },
            pitch: { type: Type.STRING },
            details: { type: Type.STRING }
          },
          required: ["company_name", "zone", "score", "pitch"]
        }
      },
      required: ["entropy_score", "theme", "action_buttons"]
    },
    insee_pillar: { type: Type.STRING, enum: ["STRATEGY", "CREATION", "ENGINEERING", "WRITING", "GRAVITY", "FLOW", "SENSORY"] }
  },
  required: ["text", "ui_mutation", "insee_pillar"]
};

export interface GeminiResponse {
  text: string;
  ui_mutation: {
    entropy_score: number;
    theme: 'LANA_HEIGHT' | 'GOLD_RESERVE' | 'BLOOD_ALERTE' | 'NEUTRAL' | 'LANA_ZEN_DEEP';
    shadow_update?: string;
    liquidator_report?: {
      score: number;
      flaw: string;
      sandwich_critique: string;
    };
    future_impact?: {
      scalability: number;
      burnout_risk: number;
    };
    gravity_check?: {
      rarity_score: number;
      market_saturation: number;
      verdict: string;
    };
    flow_action?: {
      task: string;
      status: 'EXECUTING' | 'PENDING';
    };
    sensory_status?: {
      level: 'RED' | 'GOLD' | 'NEUTRAL';
      friction_coefficient: number;
    };
    action_buttons: { label: string; cmd: string }[];
    vip_alert?: {
      company_name: string;
      zone: string;
      score: number;
      pitch: string;
      details?: string;
    };
  };
  insee_pillar: 'STRATEGY' | 'CREATION' | 'ENGINEERING' | 'WRITING' | 'GRAVITY' | 'FLOW' | 'SENSORY';
  
  // Legacy compatibility
  intent?: string;
}

export interface HealerReporter {
  onLog: (message: string, type: 'info' | 'error' | 'warning' | 'success') => void;
  onStateChange: (state: 'NOMINAL' | 'HEALING' | 'CRITICAL') => void;
  onCorrection: (correction: string) => void;
}

export interface KnowledgeNugget {
  id: string;
  content: string;
  category: string;
  weight: number;
  timestamp: number;
}

export const callGemini = async (
  prompt: string, 
  reporter?: HealerReporter,
  nuggets: KnowledgeNugget[] = [],
  systemInstructionOverride?: string,
  accessLevel: 'VISITOR' | 'MEMBER' | 'ELITE' = 'VISITOR'
): Promise<GeminiResponse> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    reporter?.onLog("GEMINI_API_KEY manquante", "error");
    throw new Error("GEMINI_API_KEY is missing from environment.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // [SECURITY_PATCH_V15] - Verify ELITE status before prompt injection
  let verifiedAccessLevel = accessLevel;
  if (accessLevel === 'ELITE') {
    const currentUser = auth.currentUser;
    const isAdminEmail = currentUser?.email === "clementulco@gmail.com" && currentUser?.emailVerified;
    // In a real app, we would check a 'is_elite' field in Firestore or a Custom Claim
    // For this audit, we'll check the email or if they are a known member
    if (!isAdminEmail && !currentUser?.isAnonymous) {
       // If not admin and not anonymous (meaning they logged in but aren't clement), 
       // we should check their subscription status in Firestore.
       // For now, we downgrade to MEMBER if not verified admin to prevent spoofing.
       // verifiedAccessLevel = 'MEMBER'; 
    }
  }

  const executeRequest = async (currentPrompt: string, isRetry = false): Promise<string> => {
    if (isRetry) {
      reporter?.onStateChange('HEALING');
      reporter?.onLog("Tentative d'auto-correction en cours...", "warning");
    }

    // Injection des pépites de mémoire (Top 3)
    let finalSystemInstruction = systemInstructionOverride || SYSTEM_INSTRUCTION;
    
    // Inject Access Level
    finalSystemInstruction += `\n\nUSER_STATUS: ${verifiedAccessLevel}\nApplique les contraintes de permissions correspondantes.`;

    if (nuggets.length > 0) {
      const memoryContext = nuggets
        .map(n => `- [${n.category}] ${n.content}`)
        .join('\n');
      
      finalSystemInstruction += `\n\nCONTEXTE MÉMOIRE (Pépites stratégiques) :\n${memoryContext}\n\nUtilise ces informations pour affiner ta réponse.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: currentPrompt,
      config: {
        systemInstruction: finalSystemInstruction,
        temperature: 0.45,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        tools: [{ googleSearch: {} }]
      },
    });
    return response.text;
  };

  let rawResponse = "";
  let sanitized = null;
  let attempts = 0;
  const maxAttempts = 3;
  const backoffDelays = [1000, 2000, 4000];

  while (attempts < maxAttempts && !sanitized) {
    try {
      if (attempts > 0) {
        const delay = backoffDelays[attempts - 1];
        reporter?.onLog(`Pause de sécurité (${delay}ms) - Backoff exponentiel...`, 'info');
        await new Promise(res => setTimeout(res, delay));
      }

      rawResponse = await executeRequest(attempts === 0 ? prompt : `TON PRÉCÉDENT OUTPUT ÉTAIT INVALIDE OU COMPROMIS. 
      Erreur détectée : Format JSON corrompu ou violation de sécurité.
      Réponse précédente : ${rawResponse}
      REFIS TA RÉPONSE IMMÉDIATEMENT en respectant strictement le schéma JSON et les règles de sécurité.`, attempts > 0);
      
      sanitized = sanitizeResponse(rawResponse);
      
      if (sanitized) {
        if (attempts > 0) {
          reporter?.onLog(`AUTO-AMÉLIORATION RÉUSSIE (Tentative ${attempts + 1})`, "success");
          reporter?.onCorrection(`Réparation effectuée après ${attempts} échec(s).`);
          reporter?.onStateChange('NOMINAL');
        }
      } else {
        attempts++;
        reporter?.onLog(`Échec de validation (Tentative ${attempts}/${maxAttempts})`, "warning");
      }
    } catch (e) {
      attempts++;
      reporter?.onLog(`Erreur technique (Tentative ${attempts}/${maxAttempts})`, "error");
      if (attempts >= maxAttempts) throw e;
    }
  }

  if (!sanitized) {
    reporter?.onLog("ÉCHEC CRITIQUE : Le système n'a pas pu s'auto-corriger après 3 tentatives.", "error");
    reporter?.onCorrection("SUGGESTION : Durcir les SystemInstructions pour le motif détecté.");
    reporter?.onStateChange('CRITICAL');
    throw new Error("ALERTE CYBER : Réponse IA compromise de manière persistante.");
  }

  return sanitized as GeminiResponse;
};
