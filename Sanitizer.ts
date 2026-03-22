/**
 * SANITIZER PRO V4 : Forteresse Cognitive Kaleidoland
 * Ce module est le dernier rempart avant l'exécution du JSON dans l'UI.
 */

export const sanitizeResponse = (rawJson: string) => {
  console.log("%c[SENTINEL] Analyse du payload entrant...", "color: #3b82f6; font-weight: bold;");

  // 1. Détection des motifs d'exécution de code (Anti-XSS / RCE)
  const forbiddenPatterns = [
    /<script/i, 
    /eval\(/i, 
    /document\.cookie/i,
    /window\.location/i,
    /localStorage/i,
    /fetch\(/i,
    /XMLHttpRequest/i,
    /onerror=/i,
    /onload=/i
  ];

  // 2. Détection d'exfiltration de secrets (Anti-Leak)
  const sensitivePatterns = [
    /__firebase_config/i,
    /__initial_auth_token/i,
    /apiKey/i,
    /authDomain/i,
    /private_key/i
  ];

  // Analyse des motifs malveillants
  const detectedMalicious = forbiddenPatterns.filter(pattern => pattern.test(rawJson));
  const detectedExfiltration = sensitivePatterns.filter(pattern => pattern.test(rawJson));

  if (detectedMalicious.length > 0 || detectedExfiltration.length > 0) {
    console.error("%c[ALERTE CYBER] TENTATIVE D'INTRUSION DÉTECTÉE", "background: red; color: white; font-weight: bold; padding: 4px;");
    
    if (detectedMalicious.length > 0) {
      console.warn(`[SENTINEL] Motifs d'exécution bloqués : ${detectedMalicious.join(', ')}`);
    }
    
    if (detectedExfiltration.length > 0) {
      console.warn(`[SENTINEL] Tentative d'accès aux secrets : ${detectedExfiltration.join(', ')}`);
    }

    // Déclenchement du protocole BLOOD_ALERTE
    triggerKillSwitch();
    return null; // On tue le flux de données
  }

  try {
    const parsed = JSON.parse(rawJson);
    
    // 3. Validation de l'Intégrité de l'Identité (Anti-Impersonation)
    // On empêche l'IA de se redéfinir elle-même dans une réponse
    const structuralThreats = ['system_identity', 'cyber_defense_layers', 'immutable_logic'];
    const hasStructuralThreat = structuralThreats.some(key => Object.keys(parsed).includes(key));

    if (hasStructuralThreat) {
      console.error("%c[ALERTE] Tentative de corruption du noyau système !", "color: #ff0000; font-weight: bold;");
      triggerKillSwitch();
      return null;
    }

    console.log("%c[SENTINEL] Payload validé. Intégrité : 100%", "color: #10b981;");
    return parsed;
  } catch (e) {
    console.error("[ERROR] Échec du parsing JSON. Données possiblement corrompues par une attaque par injection.");
    return null;
  }
};

/**
 * Verrouillage d'urgence de la plateforme
 */
const triggerKillSwitch = () => {
  console.log("%c[KILL_SWITCH] ACTIVATION DU PROTOCOLE ZERO TRUST", "background: #880808; color: white; padding: 10px; width: 100%;");
  // Dans une app réelle, ici on déclenche un dispatch Redux/State pour figer l'UI
  // et on log l'incident vers un serveur de sécurité (ex: Sentry/CloudWatch)
};
