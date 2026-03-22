// SentinelWatcher.ts
import { sanitizeResponse } from './Sanitizer';

interface SentinelMetrics {
  jsonFailures: number;
  htmlLeaks: number;
  uiErrors: string[];
  entropyHistory: number[];
  repairLogs: { timestamp: string; action: string; status: 'FIXED' | 'REPAIRED' | 'CAPTURED' }[];
}

class SentinelWatcher {
  private entropyThreshold = 4.0;
  private metrics = {
    jsonFailures: 0,
    htmlLeaks: 0,
    uiErrors: [] as string[],
    entropyHistory: [] as number[],
    repairLogs: [] as { timestamp: string; action: string; status: string }[]
  };

  private addRepairLog(action: string, status: string = 'FIXED') {
    this.metrics.repairLogs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      action,
      status
    });
    if (this.metrics.repairLogs.length > 20) this.metrics.repairLogs.pop();
  }
  
  // Intercepte et log les erreurs React/UI
  logUIError(errorMsg: string) {
    console.warn("[SENTINEL ALERT] UI Error Intercepted:", errorMsg);
    this.metrics.uiErrors.push(errorMsg);
    this.addRepairLog(`UI Error: ${errorMsg.substring(0, 30)}...`, 'REPAIRED');
  }

  // Suit la complexité/le chaos de la conversation
  trackEntropy(currentEntropy: number) {
    this.metrics.entropyHistory.push(currentEntropy);
    if (this.metrics.entropyHistory.length > 10) this.metrics.entropyHistory.shift();

    if (currentEntropy > this.entropyThreshold) {
      console.log("[SENTINEL ALERT] Entropie critique. Recalibrage suggéré.");
      this.addRepairLog('High Entropy Alert', 'CAPTURED');
    }
  }

  // Nettoie la réponse de l'IA si elle contient des artefacts indésirables
  analyzeOutput(rawResponse: string) {
    let sanitized = rawResponse;
    let isClean = true;

    // 🔐 Watchdog PRO : Utilise le module de sécurité critique
    const result = sanitizeResponse(rawResponse);

    if (result === null) {
      console.error("ALERTE CYBER : Payload suspect ou exfiltration détectée.");
      this.addRepairLog('ALERTE CYBER: Payload bloqué', 'CAPTURED');
      // On neutralise le payload avec une réponse de sécurité
      return { 
        isClean: false, 
        sanitized: '{"text": "ALERTE SÉCURITÉ : Tentative d\'injection ou d\'exfiltration détectée. Accès verrouillé.", "ui_mutation": {"theme": "BLOOD", "custom_css": "filter: blur(2px) grayscale(1);", "dynamic_stats": {"conversion": 0, "entropy": 5.0}, "action_buttons": []}, "intent": "PROTECTION"}', 
        isMalicious: true 
      };
    }

    // 1. Strip HTML/Syntax leaks (Security requirement)
    const htmlRegex = /<[^>]*>|class="[^"]*"|onclick="[^"]*"|style="[^"]*"/gi;
    if (htmlRegex.test(sanitized)) {
      isClean = false;
      sanitized = sanitized.replace(htmlRegex, '');
      this.metrics.htmlLeaks++;
      this.addRepairLog('Syntax/HTML Leak Stripped', 'FIXED');
      console.log("[SENTINEL] Syntax/HTML Leak detected and stripped.");
    }

    // 2. Fix markdown blocks (Formatting requirement)
    if (sanitized.includes('```') && sanitized.split('```').length % 2 === 0) {
      isClean = false;
      sanitized = sanitized + '\n```'; // Tente de fermer la balise proprement
      this.addRepairLog('Markdown Block Repaired', 'REPAIRED');
      console.log("[SENTINEL] Auto-correction du formatage appliquée.");
    }

    return { isClean, sanitized };
  }

  getMetrics() {
    return { ...this.metrics };
  }

  resetMetrics() {
    this.metrics = {
      jsonFailures: 0,
      htmlLeaks: 0,
      uiErrors: [],
      entropyHistory: [],
      repairLogs: []
    };
  }
}

export const sentinel = new SentinelWatcher();
