import { loginWithGoogle, monitorAuthState, sendToGemini, generateLogo } from './database.js';

const PROFILES = {
    PARTICULIER: { label: "Artisan Numérique", target: "Catalyseur (42€)", key: "créer, aide, apprendre" },
    BUSINESS: { label: "Entreprise", target: "Oracle (Audit)", key: "optimiser, rendement, automatisation" },
    COLLECTIVITY: { label: "Territoire", target: "Symbiose (Sur-mesure)", key: "mairie, ville, citoyen, bassin" },
    INVESTOR: { label: "Partenaire Stratégique", target: "Equity / Scalabilité", key: "marge, croissance, investissement" }
};

let currentProfile = PROFILES.PARTICULIER;

window.setProfile = (profileKey) => {
    const root = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');

    if (profileKey === 'pro') currentProfile = PROFILES.BUSINESS;
    else if (profileKey === 'city') currentProfile = PROFILES.COLLECTIVITY;
    else if (profileKey === 'investor') currentProfile = PROFILES.INVESTOR;
    else {
        currentProfile = PROFILES.PARTICULIER;
        // Force Light Mode for Particuliers
        root.setAttribute('data-theme', 'light');
        if (themeIcon) themeIcon.innerText = '☀️';
        localStorage.setItem('theme', 'light');
    }

    const chatTitle = document.getElementById('chat-title');
    if (chatTitle) chatTitle.innerText = `Lanazrion (${currentProfile.label})`;
    
    window.toggleChat(true);
    addMessage("Lanazrion", `Mode **${currentProfile.label}** activé. Comment puis-je vous accompagner ?`);
};

const KALEIDO_DATABASE = {
    services: {
        strategie: "Le pôle Cerveau analyse votre architecture. Conseil & Ingénierie territoriale.",
        creation: "Le pôle Cœur donne vie à votre image. Audiovisuel & Arts numériques.",
        tech: "Le Muscle automatise votre croissance. Systèmes IA & Formations.",
        redaction: "La Plume Tech traduit votre vision. Rédaction technique & Traduction."
    },
    intentions: {
        diagnostic: ["score", "ist", "test", "évaluer", "diagnostic"],
        contact: ["rdv", "café", "rencontrer", "prix", "devis"],
        investisseur: ["marge", "profit", "scalabilité", "parts", "investir"]
    }
};

window.startIST = () => {
    window.location.href = "diagnostic.html";
};

window.openOracleForm = () => {
    window.toggleChat(true);
    addMessage("Moi", "Je souhaite demander un Audit Oracle.");
    addMessage("Lanazrion", "Excellent choix. L'Audit Oracle est notre service premium pour les structures en quête de symbiose totale. Un Architecte va analyser votre demande.");
};

function formatInitialResponse(profile) {
    let resp = `Bonjour. En tant que **${profile.label}**, votre besoin est clair. `;
    
    if(profile === PROFILES.INVESTOR) {
        resp += "Notre Profit Protocol vise une scalabilité 100% IA avec un MRR cible élevé. Voulez-vous voir nos KPIs ?";
    } else if(profile === PROFILES.COLLECTIVITY) {
        resp += "La transformation de votre territoire passe par notre Indice de Symbiose. Prenons un café stratégique.";
    } else {
        resp += `Pour votre projet, le pack **${profile.target}** est la solution idéale.`;
    }
    return resp;
}

window.toggleChat = (show = false) => {
    // Start Hypnotic Flow if chat is opened for the first time
    if (LanazrionDialogue.step === 0 && !LanazrionDialogue.active) {
        const messages = document.getElementById('chat-flow');
        if (messages && messages.children.length === 0) {
            LanazrionDialogue.start();
        }
    }
};

const LanazrionBrain = {
    weights: {
        invest: { "marge": 15, "profit": 20, "croissance": 12, "scalabilité": 25, "equity": 18 },
        strategie: { "mairie": 10, "audit": 15, "territoire": 8, "oracle": 20, "planification": 12 },
        tech: { "ia": 10, "automatisation": 12, "système": 7, "code": 5 },
        creation: { "design": 8, "image": 6, "vidéo": 9, "identité": 11 }
    }
};

const LanazrionClient = {
    get userId() {
        return (window.auth && window.auth.currentUser) ? window.auth.currentUser.uid : "guest_user_kaleido";
    },

    async sendSignal(input) {
        try {
            const response = await fetch('/api/context/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: this.userId, input: input })
            });

            if (!response.ok) throw new Error("Failed to update context");
            const data = await response.json();
            
            // Adaptation de l'UI Gemini en fonction du signal ASCE
            this.applyGlobalEvolution(data.ui, data.entropy);
            return data;
        } catch (error) {
            console.error("[LanazrionClient] Error:", error);
            // Fallback values if server is down
            return { ui: "EXPLORATION_MODE", entropy: 1, topContext: [], businessScore: 0 };
        }
    },

    applyGlobalEvolution(uiMode, entropy) {
        const root = document.documentElement;
        // On injecte l'entropie dans le CSS pour des effets visuels dynamiques
        root.style.setProperty('--current-entropy', entropy);
        document.body.className = `mode-${uiMode.toLowerCase()}`;
        
        // Update UI Signal Badge
        const signalBadge = document.getElementById('context-signal');
        if (signalBadge) {
            signalBadge.innerText = uiMode.replace('_MODE', '');
            if (uiMode === 'FOCUSED_MODE') signalBadge.style.background = 'var(--p-purple)';
            else if (uiMode === 'GUIDED_MODE') signalBadge.style.background = 'var(--p-blue)';
            else signalBadge.style.background = 'var(--p-pink)';
        }
    }
};

function renderHeatmap() {
    const cloud = document.getElementById('word-cloud');
    if (!cloud) return;
    cloud.innerHTML = ""; // Reset
    
    const weights = LanazrionBrain.weights;
    let allWords = {};

    // On fusionne et on pondère les mots (Priorité Invest et Stratégie)
    for (let cat in weights) {
        for (let word in weights[cat]) {
            let power = weights[cat][word];
            // Multiplicateur de Profit : On booste les mots liés au cash
            if (cat === 'invest' || cat === 'strategie') power *= 2;
            
            allWords[word] = (allWords[word] || 0) + power;
        }
    }

    // Création des éléments visuels
    for (let word in allWords) {
        const size = Math.min(40, 12 + allWords[word] * 2);
        const opacity = Math.min(1, 0.3 + allWords[word] * 0.1);
        const color = allWords[word] > 25 ? 'var(--p-purple)' : 'var(--p-blue)';
        
        const span = document.createElement('span');
        span.innerText = word;
        if (allWords[word] > 30) span.className = "hot";
        
        span.style.cssText = `
            font-size: ${size}px;
            opacity: ${opacity};
            color: ${color};
            text-shadow: 0 0 ${allWords[word] / 5}px ${color};
            transition: 0.3s;
            cursor: help;
        `;
        span.title = `Score de conversion : ${allWords[word]}`;
        cloud.appendChild(span);
    }
}

window.toggleAdmin = () => {
    const dash = document.getElementById('admin-dashboard');
    const heatmap = document.getElementById('heatmap-container');
    if (dash) {
        const isShowing = dash.style.display === 'block';
        dash.style.display = isShowing ? 'none' : 'block';
        
        if (!isShowing) {
            if (heatmap) heatmap.style.display = 'block';
            renderHeatmap();
        }
    }
};

let leadCount = 0;
let oracleCount = 0;

function updateAdminStats(query, profile) {
    const logs = document.getElementById('admin-logs');
    const mrrStat = document.getElementById('stat-mrr');
    const oracleStat = document.getElementById('stat-oracle');
    const convStat = document.getElementById('stat-conv');
    
    if (!logs || !mrrStat || !oracleStat || !convStat) return;

    leadCount++;
    const timestamp = new Date().toLocaleTimeString();
    
    const isOracle = profile === PROFILES.COLLECTIVITY || profile === PROFILES.INVESTOR || query.length > 50;
    
    if(isOracle) {
        oracleCount++;
        logs.innerHTML += `<br>[${timestamp}] 🔮 ALERTE ORACLE (${profile.label}) : ${query.substring(0,30)}...`;
    } else {
        logs.innerHTML += `<br>[${timestamp}] 👤 Lead ${profile.label} enregistré.`;
    }

    mrrStat.innerText = (leadCount * 42) + " €";
    oracleStat.innerText = oracleCount;
    convStat.innerText = Math.min(100, (leadCount * 12)) + "%";
    
    logs.scrollTop = logs.scrollHeight;
}

window.startDiag = () => {
    const root = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');
    
    // Force Light Mode for Particuliers
    root.setAttribute('data-theme', 'light');
    if (themeIcon) themeIcon.innerText = '☀️';
    localStorage.setItem('theme', 'light');
    
    window.location.href = "diagnostic.html";
};

window.startMiniDiag = (type) => {
    window.toggleChat(true);
    let msg = "";
    if (type === 'crea') msg = "Je souhaite créer un visuel (Flash Création).";
    else if (type === 'tech') msg = "J'ai besoin d'une assistance technique (SOS Digital).";
    else if (type === 'text') msg = "Je souhaite rédiger ou traduire un texte (Plume Express).";
    
    addMessage("Moi", msg);
    addMessage("Lanazrion", "C'est noté. Je lance le protocole **Pack Éveil**. Donnez-moi quelques détails sur votre besoin.");
    
    // Trigger payment proposal after a short delay
    setTimeout(() => {
        proposePayment(type);
    }, 2000);
};

window.proposePayment = (type) => {
    const prices = { 'crea': 15, 'tech': 30, 'text': 10 };
    const priceEl = document.getElementById('service-price');
    const checkoutEl = document.getElementById('checkout-express');
    
    if (priceEl && checkoutEl) {
        priceEl.innerText = prices[type] || 15;
        checkoutEl.style.display = 'block';
        addMessage("Lanazrion", "J'ai préparé les outils. Dès la validation, je génère votre résultat.");
    }
};

window.initiateStripe = () => {
    const checkoutEl = document.getElementById('checkout-express');
    if (checkoutEl) {
        checkoutEl.innerHTML = `
            <div style="padding: 40px;">
                <div class="loader" style="border: 4px solid var(--p-blue); border-top: 4px solid transparent; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <p>Traitement sécurisé...</p>
            </div>
        `;
        
        setTimeout(() => {
            checkoutEl.innerHTML = `
                <div style="padding: 40px;">
                    <span style="font-size: 3rem;">✅</span>
                    <h3 style="margin-top: 20px;">Paiement Validé</h3>
                    <p style="font-size: 0.9rem; opacity: 0.8;">Lanazrion commence le travail.</p>
                    <button class="g-btn" onclick="document.getElementById('checkout-express').style.display='none'; location.reload();" style="margin-top: 20px;">Accéder au résultat</button>
                </div>
            `;
            addMessage("Lanazrion", "Paiement reçu. Je débloque les accès et je lance la génération. Vérifiez votre Dashboard dans quelques instants.");
        }, 3000);
    }
};

window.generateLivePalette = () => {
    const nameInput = document.getElementById('project-name');
    if (!nameInput) return;
    const name = nameInput.value;
    if (name.length < 2) return;

    const display = document.getElementById('palette-display');
    if (!display) return;
    display.innerHTML = ""; // Reset

    // Algorithme de génération déterministe
    for (let i = 0; i < 4; i++) {
        const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, i * 100);
        const hue = hash % 360;
        const color = `hsl(${hue}, 70%, 85%)`; // 85% de luminosité pour le mode Pastel
        
        const swatch = document.createElement('div');
        swatch.className = "color-swatch-anim";
        swatch.style.background = color;
        swatch.innerHTML = `<span style="font-size: 0.5rem; opacity: 0.5;">${color}</span>`;
        display.appendChild(swatch);
    }
};

const LEAD_SCORING = {
    keywords: {
        "budget": 5, "mairie": 10, "investissement": 15, "urgent": 5, "création": 2, "automatiser": 8, "roi": 7, "croissance": 6, "audit": 10, "oracle": 15
    },
    thresholds: {
        oracle: 20,    // Client High-Ticket (Mairie, Grosse Entreprise)
        catalyseur: 10, // Client Récurrent (Abonnement 42€)
        explorateur: 0  // Particulier / Curieux
    }
};

function analyzeIntent(userInput) {
    let score = 0;
    const words = userInput.toLowerCase().split(/[\s,.'!?]+/);
    
    words.forEach(word => {
        if (LEAD_SCORING.keywords[word]) score += LEAD_SCORING.keywords[word];
    });

    return score;
}

function extractPainPoint(userInput) {
    const painMap = {
        "peur": "SÉCURITÉ",
        "cher": "BUDGET",
        "prix": "BUDGET",
        "coût": "BUDGET",
        "compliqué": "COMPLEXITÉ",
        "difficile": "COMPLEXITÉ",
        "temps": "URGENCE",
        "vite": "URGENCE",
        "perdu": "STRATÉGIE",
        "comment": "STRATÉGIE"
    };
    
    const words = userInput.toLowerCase().split(/[\s,.'!?]+/);
    for (let word of words) {
        if (painMap[word]) return painMap[word];
    }
    return "GÉNÉRAL";
}

function updateDatabase(userId, query, score) {
    const category = score >= LEAD_SCORING.thresholds.oracle ? 'ORACLE' : (score >= LEAD_SCORING.thresholds.catalyseur ? 'CATALYSEUR' : 'EXPLORATEUR');
    const painPoint = extractPainPoint(query);
    
    const interaction = {
        timestamp: new Date().toISOString(),
        query: query,
        score: score,
        category: category,
        painPoint: painPoint
    };

    // Stockage local + Envoi vers ton dashboard de pilotage
    let history = JSON.parse(localStorage.getItem('lanazrion_leads')) || [];
    history.push(interaction);
    localStorage.setItem('lanazrion_leads', JSON.stringify(history));

    // Si c'est un profil ORACLE, on déclenche une alerte immédiate
    if (category === 'ORACLE') {
        notifyArchitect(`⚠️ GROS POISSON DÉTECTÉ [${painPoint}] : ` + query);
    }
}

let currentMaturity = 0;

function updateMaturity(userInput) {
    let gain = 0;
    const input = userInput.toLowerCase();

    // Analyse de la précision des données
    if (input.length > 50) gain += 5; // Développement de l'idée
    if (/\d+/.test(input)) gain += 10; // Présence de chiffres (budget, dates, volumes)
    if (input.includes("stratégie") || input.includes("objectif")) gain += 8;
    if (input.includes("investir") || input.includes("financement") || input.includes("budget")) gain += 15;

    currentMaturity = Math.min(100, currentMaturity + gain);
    renderMaturity();
}

function renderMaturity() {
    const fill = document.getElementById('maturity-fill');
    const pct = document.getElementById('maturity-pct');
    const status = document.getElementById('maturity-status');
    const logo = document.querySelector('.symbiosis-logo');

    if (fill) fill.style.width = currentMaturity + "%";
    if (pct) pct.innerText = currentMaturity + "%";

    if (status) {
        if (currentMaturity < 30) {
            status.innerText = "Phase d'Éveil : Continuez l'exploration.";
        } else if (currentMaturity < 70) {
            status.innerText = "Phase de Cristallisation : Le projet prend forme.";
            if (logo) logo.classList.add('logo-glow');
        } else if (currentMaturity < 100) {
            status.innerText = "Phase Oracle : Maturité critique atteinte. Contactez l'Architecte.";
            status.classList.add('hot');
            if (logo) {
                logo.classList.remove('logo-glow');
                logo.classList.add('logo-thinking'); // Reuse existing animation for high activity
            }
        } else {
            status.innerText = "SYMBIOSE TOTALE : Accès Oracle Débloqué. Audit Stratégique Recommandé.";
            status.classList.add('hot');
            if (logo) {
                logo.classList.remove('logo-thinking', 'logo-glow');
                logo.classList.add('logo-explode');
            }
        }
    }
}

function notifyArchitect(msg) {
    console.warn("[ARCHITECT NOTIFICATION]", msg);
    // On pourrait ajouter un toast ou une alerte admin ici
}

const ENTITY_MAP = {
    MONEY: /€|euros|budget|profit|million|investir/gi,
    TECH: /automatiser|logiciel|app|saas|code|muscle/gi,
    STRAT: /vision|territoire|mairie|cerveau|stratégie/gi
};

function extractGeminiEntities(input) {
    let detected = [];
    for (let [key, regex] of Object.entries(ENTITY_MAP)) {
        if (regex.test(input)) detected.push(key);
    }
    return detected; // Retourne ['MONEY', 'STRAT'] par exemple
}

const LanazrionMemory = {
    history: [],
    add(role, content) {
        this.history.push({ role, content });
        if (this.history.length > 10) this.history.shift(); // Garde les 10 derniers échanges
        localStorage.setItem('lanazrion_memory', JSON.stringify(this.history));
    },
    getSummary() {
        const stored = localStorage.getItem('lanazrion_memory');
        if (stored && this.history.length === 0) this.history = JSON.parse(stored);
        return this.history.map(h => `${h.role}: ${h.content}`).join('\n');
    }
};

function triggerPrismFeedback(type) {
    const logo = document.getElementById('app-logo');
    if (!logo) return;
    if (type === 'HIGH_VALUE') {
        logo.style.filter = "drop-shadow(0 0 15px var(--p-purple)) brightness(1.2)";
        logo.style.transform = "scale(1.1)";
    }
    setTimeout(() => {
        logo.style.filter = "none";
        logo.style.transform = "scale(1)";
    }, 1000);
}

function renderSmartButtons(entities) {
    const container = document.getElementById('quick-leads');
    if (!container) return;
    let html = "";
    if (entities.includes('MONEY')) {
        html += `<button class="hypnotic-btn" onclick="openOracleForm()">Débloquer l'Audit Oracle</button>`;
    } else {
        html += `<button class="hypnotic-btn" onclick="window.quickAction('creatif')">Explorer le Pack Éveil</button>`;
    }
    container.innerHTML = html;
}

async function showThinkingChain() {
    const chain = ["Analyse du contexte...", "Recherche de patterns Kaleidoland...", "Optimisation du Profit Protocol..."];
    const statusEl = document.getElementById('thinking-status');
    const indicator = document.getElementById('thinking-indicator');
    const logo = document.querySelector('.symbiosis-logo');
    
    if (indicator) indicator.classList.remove('hidden');
    if (logo) logo.classList.add('logo-thinking');
    
    if (statusEl) {
        statusEl.style.display = 'block';
        for (let step of chain) {
            statusEl.innerText = step;
            statusEl.style.opacity = 1;
            await new Promise(r => setTimeout(r, 600));
            statusEl.style.opacity = 0;
        }
    }
}

async function streamGeminiStyle(element, text) {
    element.innerHTML = ""; // Reset de la bulle
    element.classList.remove('finished');
    const words = text.split(" ");
    const logo = document.querySelector('.symbiosis-logo');
    
    if (logo) logo.classList.add('logo-glow');
    
    let i = 0;
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (i < words.length) {
                element.innerHTML += words[i] + " ";
                i++;
                // Auto-scroll intelligent
                const scroller = document.getElementById('chat-scroller');
                if (scroller) scroller.scrollTop = scroller.scrollHeight;
            } else {
                clearInterval(interval);
                element.classList.add("finished");
                if (logo) logo.classList.remove('logo-glow');
                resolve();
            }
        }, 45 + Math.random() * 30); // Rythme organique variable
    });
}

const LanazrionDialogue = {
    step: 0,
    context: {},
    active: false,

    start() {
        this.step = 0;
        this.active = true;
        this.renderStep();
    },

    renderStep() {
        switch(this.step) {
            case 0:
                const msg0 = "Initialisation du Prisme... Lanazrion est en ligne. Je ne suis pas un assistant, je suis l'hémisphère droit de votre vision. Quel projet souhaitez-vous faire passer à travers le spectre Kaleidoland aujourd'hui ?";
                const buttons0 = `
                    <div class="hypnotic-btn-group">
                        <button class="hypnotic-btn" onclick="LanazrionDialogue.handleStep('🏢 Territoire/Mairie')">🏢 Territoire/Mairie</button>
                        <button class="hypnotic-btn" onclick="LanazrionDialogue.handleStep('🚀 Business/SaaS')">🚀 Business/SaaS</button>
                        <button class="hypnotic-btn" onclick="LanazrionDialogue.handleStep('✨ Projet Créatif')">✨ Projet Créatif</button>
                    </div>
                `;
                addMessage("Lanazrion", msg0 + buttons0, { brain: 10, heart: 10, muscle: 80, confidence: 30 });
                break;
            case 1:
                const msg1 = "Analyse du segment terminée. Pour calibrer mes calculs : votre priorité actuelle est-elle la Clarté Stratégique (Cerveau), l'Impact Visuel (Cœur) ou l'Efficacité Technique (Muscle) ?";
                const buttons1 = `
                    <div class="hypnotic-btn-group">
                        <button class="hypnotic-btn" onclick="LanazrionDialogue.handleStep('🧠 Cerveau')">🧠 Cerveau</button>
                        <button class="hypnotic-btn" onclick="LanazrionDialogue.handleStep('💖 Cœur')">💖 Cœur</button>
                        <button class="hypnotic-btn" onclick="LanazrionDialogue.handleStep('💪 Muscle')">💪 Muscle</button>
                    </div>
                `;
                addMessage("Lanazrion", msg1 + buttons1, { brain: 33, heart: 33, muscle: 34, confidence: 50 });
                break;
            case 2:
                addMessage("Lanazrion", "Intéressant. Mon Machine Learning détecte un potentiel inexploité ici. Pour que je puisse générer une réponse sur-mesure, quel est l'enjeu majeur de ce projet pour vous dans les 90 prochains jours ?", { brain: 50, heart: 20, muscle: 30, confidence: 70 });
                break;
            case 3:
                addMessage("Lanazrion", "C'est noté. Je prépare un diagnostic préliminaire. Voulez-vous que je l'envoie à l'Architecte pour un Audit Oracle ou préférez-vous mon Pack Éveil immédiat ?", { brain: 60, heart: 10, muscle: 30, confidence: 90 });
                break;
            default:
                this.active = false;
        }
    },

    handleStep(userInput) {
        addMessage("Moi", userInput);
        this.saveContext(userInput);
        
        const score = analyzeIntent(userInput);
        updateDatabase("user_1", userInput, score);

        this.step++;
        setTimeout(() => this.renderStep(), 1000);
    },

    saveContext(input) {
        this.context[`step_${this.step}`] = input;
        console.log("[CONTEXT SAVED]", this.context);
    }
};

window.LanazrionDialogue = LanazrionDialogue;

async function thinkingProcess() {
    await showThinkingChain();
}

function showThinking(show) {
    const indicator = document.getElementById('thinking-indicator');
    const logo = document.querySelector('.symbiosis-logo');
    if (indicator) {
        if (show) indicator.classList.remove('hidden');
        else indicator.classList.add('hidden');
    }
    if (logo) {
        if (show) logo.classList.add('logo-thinking');
        else logo.classList.remove('logo-thinking');
    }
}

async function streamText(element, text) {
    return streamGeminiStyle(element, text);
}

function addMessage(sender, text, prisme = null) {
    const box = document.getElementById('chat-flow');
    if (!box) return;
    const div = document.createElement('div');
    div.className = sender === "Moi" ? "msg-user" : "ai-bubble-content";
    
    if (sender === "Moi") {
        div.innerHTML = `<strong>${sender}:</strong> ${text}`;
        box.appendChild(div);
        const scroller = document.getElementById('chat-scroller');
        if (scroller) scroller.scrollTop = scroller.scrollHeight;
    } else {
        // Bot message with streaming
        const bubbleId = "bubble-" + Date.now();
        
        if (prisme) {
            const brain = prisme.brain || 33;
            const heart = prisme.heart || 33;
            const muscle = prisme.muscle || 34;
            const confidence = prisme.confidence || 50;
            
            div.innerHTML = `
                <strong>${sender}:</strong>
                <div class="bento-response" style="background:transparent; border:none; padding:0;">
                    <div id="${bubbleId}-text" class="ai-bubble-content-inner"></div>
                    <div class="response-spectre">
                        <div class="spectre-bar brain" style="width: ${brain}%;" title="Cerveau (Stratégie)"></div>
                        <div class="spectre-bar heart" style="width: ${heart}%;" title="Cœur (Création)"></div>
                        <div class="spectre-bar muscle" style="width: ${muscle}%;" title="Muscle (Technique)"></div>
                    </div>
                    <div class="confidence-gauge">
                        <span style="font-size:0.6rem; opacity:0.6">Confiance IA:</span>
                        <div class="gauge-track">
                            <div class="gauge-fill" style="width: ${confidence}%"></div>
                        </div>
                        <span style="font-size:0.6rem; font-weight:bold">${confidence}%</span>
                    </div>
                </div>
            `;
            box.appendChild(div);
            const target = document.getElementById(`${bubbleId}-text`);
            return streamText(target, text);
        } else {
            div.innerHTML = `<strong>${sender}:</strong> <span id="${bubbleId}" class="ai-bubble-content-inner"></span>`;
            box.appendChild(div);
            const target = document.getElementById(bubbleId);
            return streamText(target, text);
        }
    }
}

// On garde detectProfile pour la logique admin
async function detectProfile(query) {
    const q = query.toLowerCase();
    if (q.includes('mairie') || q.includes('collectivité') || q.includes('ville')) return PROFILES.COLLECTIVITY;
    if (q.includes('entreprise') || q.includes('business') || q.includes('roi')) return PROFILES.BUSINESS;
    if (q.includes('investir') || q.includes('levée') || q.includes('parts')) return PROFILES.INVESTOR;
    return currentProfile;
}

/**
 * LANAZRION - MASTER CORE 
 * Fusion [Gemini UI-Cortex] + [GPT Semantic-Engine]
 */
const LanazrionApp = {
    client: LanazrionClient,
    memory: LanazrionMemory,
    isThinking: false,

    async handleInput(query = null) {
        const inputField = document.getElementById('user-query');
        const userInput = query || (inputField ? inputField.value.trim() : "");
        if (!userInput || this.isThinking) return;

        if (LanazrionDialogue.active) {
            LanazrionDialogue.handleStep(userInput);
            if (inputField) inputField.value = "";
            return;
        }

        // 1. SIGNAL & CONTEXTE (Fragment Secret GPT) - Server-side update
        const contextData = await this.client.sendSignal(userInput);
        const uiSignal = contextData.ui;
        const topContext = contextData.topContext;

        // 2. MÉMOIRE & ÉVEIL (Brique Gemini)
        this.memory.add('Moi', userInput);
        updateMaturity(userInput); // Jauge de maturité
        if (inputField) inputField.value = "";

        // 3. RÉACTION DE L'INTERFACE
        // adaptUI is now partially handled by applyGlobalEvolution in client
        if (contextData.isWhale) {
            notifyArchitect(`🐋 BALEINE DÉTECTÉE : ${userInput}`);
        }
        
        addMessage("Moi", userInput);
        await this.generateResponse(userInput, topContext, uiSignal);
    },

    async generateResponse(input, context, uiSignal) {
        this.isThinking = true;
        showThinking(true);
        
        const score = analyzeIntent(input);
        updateDatabase("user_id", input, score);
        
        const detectedProfile = await detectProfile(input);
        if (detectedProfile !== currentProfile) {
            currentProfile = detectedProfile;
            addMessage("Lanazrion", formatInitialResponse(currentProfile), { brain: 40, heart: 40, muscle: 20, confidence: 60 });
        }

        updateAdminStats(input, currentProfile);

        // Cortex V4: Thinking Process (Show Thinking Chain)
        await showThinkingChain();

        // NLU Local: Extract Entities
        const entities = extractGeminiEntities(input);
        if (entities.length > 0) {
            triggerPrismFeedback('HIGH_VALUE');
        }
        
        // Dynamic CTA: Render Smart Buttons
        renderSmartButtons(entities);

        // Get Memory Summary for Context
        const memoryContext = this.memory.getSummary();

        let prompt = `[CONTEXTE RÉCENT:\n${memoryContext}]\n[SIGNAL UI: ${uiSignal}] [TOP CONTEXT: ${context.join(', ')}]\n[PROFIL: ${currentProfile.label}] [SCORE: ${score}] [MATURITÉ: ${currentMaturity}%] ${input}`;
        if (currentMaturity >= 100) {
            prompt += " [URGENT: MATURITÉ 100% - Propose l'Audit Stratégique Oracle à 2000€ au lieu du pack éveil]";
        }

        const reply = await sendToGemini(prompt);
        
        // Context Memory: Add bot response
        this.memory.add("Lanazrion", reply);

        // Lanazrion V4: Confidence Gauge Logic
        const confidence = input.length > 20 ? 85 : 45;
        
        // Spectre logic
        const brain = score >= LEAD_SCORING.thresholds.oracle ? 60 : 30;
        const heart = 20;
        const muscle = 100 - brain - heart;
        
        await addMessage("Lanazrion", reply, { brain, heart, muscle, confidence });
        
        showThinking(false);
        this.isThinking = false;
    }
};

window.LanazrionApp = LanazrionApp;

window.quickAction = (type) => {
    const queries = {
        'mairie': "Je souhaite discuter d'un projet pour ma mairie/collectivité.",
        'business': "J'ai un projet de business/SaaS à automatiser.",
        'creatif': "Je cherche un accompagnement pour un projet créatif/numérique."
    };
    LanazrionApp.handleInput(queries[type]);
};

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('google-login-btn');
    const userQuery = document.getElementById('user-query');
    const sendTrigger = document.getElementById('send-trigger');

    if(loginBtn) loginBtn.onclick = () => loginWithGoogle();

    if (sendTrigger) {
        sendTrigger.onclick = () => {
            if (userQuery) LanazrionApp.handleInput(userQuery.value);
        };
    }

    if (userQuery) {
        userQuery.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                LanazrionApp.handleInput(userQuery.value);
            }
        });
    }

    monitorAuthState((user) => {
        const catEyes = document.querySelector('.cat-eyes');
        if(user) {
            const authContainer = document.getElementById('auth-container');
            if (authContainer) {
                authContainer.innerHTML = `
                    <img src="${user.photoURL}" style="width:32px; border-radius:50%; border:1px solid var(--pastel-blue);">
                `;
            }
            if (catEyes) {
                catEyes.style.animationPlayState = 'running';
                console.log("Lanazrion est vivant. Bonjour, " + user.displayName);
            }
        } else {
            if (catEyes) {
                catEyes.style.animationPlayState = 'paused';
            }
        }
    });

    // Symbiosis Logo Generation & Caching
    const updateLogo = async () => {
        const logoImg = document.querySelector('.symbiosis-logo');
        if (!logoImg) return;

        const cachedLogo = localStorage.getItem('kaleidoland_logo');
        if (cachedLogo) {
            logoImg.src = cachedLogo;
            return;
        }

        const newLogo = await generateLogo();
        if (newLogo) {
            logoImg.src = newLogo;
            localStorage.setItem('kaleidoland_logo', newLogo);
        }
    };
    updateLogo();
    window.toggleChat();

    // Dual-Prism System (Theme Toggle)
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const root = document.documentElement;

    if (themeToggle && themeIcon) {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        root.setAttribute('data-theme', currentTheme);
        themeIcon.innerText = currentTheme === 'dark' ? '🌙' : '☀️';

        themeToggle.addEventListener('click', () => {
            const isDark = root.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            
            root.setAttribute('data-theme', newTheme);
            themeIcon.innerText = newTheme === 'dark' ? '🌙' : '☀️';
            localStorage.setItem('theme', newTheme);
            
            window.toggleChat(true);
            addMessage("Lanazrion", `Passage en mode **${newTheme === 'dark' ? 'Sombre' : 'Clair'}**. Adaptation de la vision...`);
        });
    }
});
