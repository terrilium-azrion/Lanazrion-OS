const Calculator = {
  questions: [
    {
      id: 1,
      text: "Quel est le pôle dominant de votre projet actuel ?",
      options: [
        { text: "Cerveau (Stratégie & Vision)", value: 10, pole: "CERVEAU" },
        { text: "Cœur (Identité & Design)", value: 10, pole: "COEUR" },
        { text: "Muscle (Action & Tech)", value: 10, pole: "MUSCLE" }
      ]
    },
    {
      id: 2,
      text: "Quel est votre niveau de maturité digitale ?",
      options: [
        { text: "Émergent (Idée seule)", value: 5 },
        { text: "Structuré (MVP existant)", value: 15 },
        { text: "Établi (Croissance active)", value: 25 }
      ]
    },
    {
      id: 3,
      text: "Quelle est l'urgence de votre transformation ?",
      options: [
        { text: "Exploration (6-12 mois)", value: 5 },
        { text: "Accélération (3-6 mois)", value: 15 },
        { text: "Immédiat (Moins de 3 mois)", value: 25 }
      ]
    }
  ],

  calculateScore(answers) {
    let totalScore = 0;
    let poleScores = { CERVEAU: 0, COEUR: 0, MUSCLE: 0 };
    
    answers.forEach(answer => {
      totalScore += answer.value;
      if (answer.pole) {
        poleScores[answer.pole] += answer.value;
      }
    });

    // Determine dominant pole
    let dominantPole = Object.keys(poleScores).reduce((a, b) => poleScores[a] > poleScores[b] ? a : b);
    
    return {
      total: totalScore,
      dominantPole,
      poleScores,
      level: totalScore > 50 ? "EXPERT" : totalScore > 30 ? "AVANCÉ" : "DÉBUTANT"
    };
  },

  getRecommendation(results) {
    const recommendations = {
      CERVEAU: "Votre vision est solide, mais nécessite une structure cognitive plus profonde. Lanazrion peut arbitrer vos choix stratégiques.",
      COEUR: "Votre identité est vibrante. Nous devons maintenant la cristalliser dans un design prismatique inoubliable.",
      MUSCLE: "Votre capacité d'action est impressionnante. Optimisons vos processus techniques pour une efficacité maximale."
    };
    return recommendations[results.dominantPole] || "Une approche holistique est recommandée.";
  }
};

export { Calculator };
