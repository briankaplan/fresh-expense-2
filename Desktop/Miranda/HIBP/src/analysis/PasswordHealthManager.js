export class PasswordHealthManager {
  constructor() {
    this.analyzer = new PasswordAnalyzer();
    this.scores = new Map();
    this.thresholds = {
      critical: 30,
      weak: 50,
      moderate: 70,
      strong: 90
    };
  }

  async calculateHealthScore(password, context = {}) {
    const analysis = await this.analyzer.analyzePassword(password, context);
    
    const score = {
      overall: analysis.strength,
      factors: {
        strength: analysis.strength,
        uniqueness: this.calculateUniquenessScore(password),
        age: this.calculateAgeScore(context.created),
        complexity: this.calculateComplexityScore(password),
        reuse: analysis.reused ? 0 : 100,
        breach: analysis.breached ? 0 : 100
      },
      issues: analysis.issues,
      recommendations: this.generateRecommendations(analysis)
    };

    // Calculate weighted average
    score.overall = this.calculateWeightedScore(score.factors);
    
    // Save score
    this.scores.set(context.id, score);
    
    return score;
  }
} 