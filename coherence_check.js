/**
 * TEST : Validation de la boucle de rétroaction ASCE + AZRION
 * Objectif : Mesurer la baisse d'entropie post-enrichissement.
 * 
 * Ce script peut être exécuté via node coherence_check.js
 */

const axios = require('axios');

const API_URL = process.env.APP_URL || 'http://localhost:3000';

async function runCoherenceTest() {
    console.log("--- DÉMARRAGE DU TEST DE COHÉRENCE LANAZRION/AZRION ---");
    console.log(`Cible : ${API_URL}/api/admin/test/coherence`);

    try {
        const response = await axios.post(`${API_URL}/api/admin/test/coherence`);
        const data = response.data;

        console.log("\n[1] ÉTAT INITIAL (T0)");
        console.log(`    Input : "${data.initialInput}"`);
        console.log(`    Entropie : ${data.t0.entropy.toFixed(4)} (${data.t0.status})`);

        console.log("\n[2] INTERVENTION AZRION");
        console.log(`    Tokens injectés : ${data.azrion.injected.join(', ')}`);
        console.log(`    Boost de maturité : +${(data.azrion.boost * 100).toFixed(0)}%`);

        console.log("\n[3] RÉSULTAT POST-ENRICHISSEMENT (T1)");
        console.log(`    Entropie : ${data.t1.entropy.toFixed(4)} (${data.t1.status})`);

        console.log("\n--- BILAN DE COHÉRENCE ---");
        console.log(`Chute d'entropie : ${data.results.entropyDrop}`);
        console.log(`Efficacité : ${data.results.efficiency}`);
        
        if (data.results.success) {
            console.log("✅ TEST RÉUSSI : Stabilisation du contexte confirmée (> 20%).");
        } else {
            console.log("❌ TEST ÉCHOUÉ : La stabilisation est insuffisante.");
        }

    } catch (error) {
        console.error("Erreur lors de l'exécution du test :", error.message);
        if (error.response) {
            console.error("Détails :", error.response.data);
        }
    }
}

runCoherenceTest();
