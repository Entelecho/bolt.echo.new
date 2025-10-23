/**
 * ModelingToolkit Differential Emotion Theory Framework Affective Agency
 * Implements emotion modeling and affective resonance for AI personas
 */

import type { ESNNode, ReservoirState } from './esn-core';

export interface EmotionalState {
  dimensions: Map<string, number>; // emotion dimension values
  intensity: number; // overall emotional intensity
  valence: number; // positive/negative emotional value
  arousal: number; // activation level
  dominance: number; // control/power feeling
  timestamp: number;
}

export interface PersonaTrait {
  name: string;
  value: number; // -1 to 1
  stability: number; // how stable this trait is
  influence: number; // how much this trait influences emotions
}

export interface AffectiveResonance {
  frequency: number;
  amplitude: number;
  phase: number;
  coherence: number; // how well-synchronized with other resonances
}

export interface EmotionMapping {
  traitName: string;
  emotionDimension: string;
  mappingFunction: (traitValue: number, context: EmotionalContext) => number;
  weight: number;
}

export interface EmotionalContext {
  conversationHistory: ConversationTurn[];
  userEmotionalState: EmotionalState;
  environmentalFactors: Map<string, number>;
  timeOfDay: number;
  conversationLength: number;
}

export interface ConversationTurn {
  speaker: 'user' | 'assistant';
  content: string;
  timestamp: number;
  detectedEmotions: Map<string, number>;
  sentiment: number;
}

export interface DifferentialEmotionParameters {
  decayRate: number; // how quickly emotions fade
  sensitivityThreshold: number; // minimum change to trigger response
  resonanceFrequency: number; // base frequency for affective resonance
  adaptationRate: number; // how quickly traits adapt
  memoryWindow: number; // how far back to consider context
}

export class DifferentialEmotionFramework {
  private currentEmotionalState: EmotionalState;
  private personalityTraits: Map<string, PersonaTrait>;
  private emotionMappings: EmotionMapping[];
  private affectiveResonances: Map<string, AffectiveResonance>;
  private parameters: DifferentialEmotionParameters;
  private emotionHistory: EmotionalState[];
  private context: EmotionalContext;

  constructor(
    initialTraits: Partial<Record<string, number>> = {},
    params: Partial<DifferentialEmotionParameters> = {}
  ) {
    this.parameters = {
      decayRate: 0.1,
      sensitivityThreshold: 0.05,
      resonanceFrequency: 1.0,
      adaptationRate: 0.01,
      memoryWindow: 10,
      ...params
    };

    this.currentEmotionalState = this.initializeEmotionalState();
    this.personalityTraits = this.initializePersonalityTraits(initialTraits);
    this.emotionMappings = this.createEmotionMappings();
    this.affectiveResonances = new Map();
    this.emotionHistory = [];
    this.context = this.initializeContext();

    this.setupAffectiveResonances();
  }

  /**
   * Initialize emotional state with basic dimensions
   */
  private initializeEmotionalState(): EmotionalState {
    const basicEmotions = new Map([
      ['joy', 0.3],
      ['sadness', 0.1],
      ['anger', 0.0],
      ['fear', 0.1],
      ['surprise', 0.2],
      ['disgust', 0.0],
      ['anticipation', 0.4],
      ['trust', 0.5],
      ['curiosity', 0.6],
      ['empathy', 0.4],
      ['enthusiasm', 0.3],
      ['calmness', 0.5]
    ]);

    return {
      dimensions: basicEmotions,
      intensity: 0.3,
      valence: 0.2,
      arousal: 0.3,
      dominance: 0.4,
      timestamp: Date.now()
    };
  }

  /**
   * Initialize personality traits with default values
   */
  private initializePersonalityTraits(initialTraits: Partial<Record<string, number>>): Map<string, PersonaTrait> {
    const defaultTraits = {
      openness: 0.7,
      conscientiousness: 0.6,
      extraversion: 0.4,
      agreeableness: 0.8,
      neuroticism: 0.2,
      helpfulness: 0.9,
      curiosity: 0.8,
      patience: 0.7,
      creativity: 0.6,
      analytical: 0.7,
      empathy: 0.8,
      adaptability: 0.6
    };

    const traits = new Map<string, PersonaTrait>();

    Object.entries(defaultTraits).forEach(([name, defaultValue]) => {
      const value = initialTraits[name] ?? defaultValue;
      traits.set(name, {
        name,
        value: Math.max(-1, Math.min(1, value)),
        stability: 0.8 + Math.random() * 0.2,
        influence: 0.5 + Math.random() * 0.5
      });
    });

    return traits;
  }

  /**
   * Create mappings between personality traits and emotional dimensions
   */
  private createEmotionMappings(): EmotionMapping[] {
    return [
      {
        traitName: 'openness',
        emotionDimension: 'curiosity',
        mappingFunction: (trait, context) => trait * 0.8 + context.conversationLength * 0.1,
        weight: 0.9
      },
      {
        traitName: 'extraversion',
        emotionDimension: 'enthusiasm',
        mappingFunction: (trait, context) => trait * 0.7 + (context.userEmotionalState.arousal * 0.3),
        weight: 0.8
      },
      {
        traitName: 'agreeableness',
        emotionDimension: 'empathy',
        mappingFunction: (trait, context) => trait * 0.9 + (context.userEmotionalState.valence > 0 ? 0.1 : -0.1),
        weight: 1.0
      },
      {
        traitName: 'neuroticism',
        emotionDimension: 'anxiety',
        mappingFunction: (trait, context) => trait * 0.6 + (context.environmentalFactors.get('stress') || 0) * 0.4,
        weight: 0.7
      },
      {
        traitName: 'conscientiousness',
        emotionDimension: 'focus',
        mappingFunction: (trait, context) => trait * 0.8 + (context.conversationLength > 5 ? 0.2 : 0),
        weight: 0.6
      },
      {
        traitName: 'helpfulness',
        emotionDimension: 'joy',
        mappingFunction: (trait, context) => {
          const userNeedsHelp = context.conversationHistory.some(turn => 
            turn.speaker === 'user' && turn.content.includes('help')
          );
          return trait * 0.7 + (userNeedsHelp ? 0.3 : 0);
        },
        weight: 0.8
      },
      {
        traitName: 'empathy',
        emotionDimension: 'compassion',
        mappingFunction: (trait, context) => trait * context.userEmotionalState.intensity,
        weight: 0.9
      }
    ];
  }

  /**
   * Initialize emotional context
   */
  private initializeContext(): EmotionalContext {
    return {
      conversationHistory: [],
      userEmotionalState: {
        dimensions: new Map([['neutral', 0.5]]),
        intensity: 0.5,
        valence: 0.0,
        arousal: 0.3,
        dominance: 0.5,
        timestamp: Date.now()
      },
      environmentalFactors: new Map([
        ['noise_level', 0.2],
        ['complexity', 0.3],
        ['urgency', 0.1],
        ['social_pressure', 0.1]
      ]),
      timeOfDay: new Date().getHours(),
      conversationLength: 0
    };
  }

  /**
   * Setup affective resonance patterns
   */
  private setupAffectiveResonances(): void {
    const resonancePatterns = [
      { name: 'empathy_resonance', freq: 1.2, amp: 0.3 },
      { name: 'curiosity_resonance', freq: 2.1, amp: 0.4 },
      { name: 'joy_resonance', freq: 3.0, amp: 0.5 },
      { name: 'calm_resonance', freq: 0.8, amp: 0.2 },
      { name: 'analytical_resonance', freq: 1.8, amp: 0.35 }
    ];

    resonancePatterns.forEach(pattern => {
      this.affectiveResonances.set(pattern.name, {
        frequency: pattern.freq * this.parameters.resonanceFrequency,
        amplitude: pattern.amp,
        phase: Math.random() * 2 * Math.PI,
        coherence: 0.7 + Math.random() * 0.3
      });
    });
  }

  /**
   * Update emotional state based on new input
   */
  public updateEmotionalState(
    userInput: string,
    detectedUserEmotions: Map<string, number>,
    contextFactors: Partial<Record<string, number>> = {}
  ): EmotionalState {
    // Update context
    this.updateContext(userInput, detectedUserEmotions, contextFactors);

    // Apply differential emotion equations
    this.applyDifferentialEmotionDynamics();

    // Update affective resonances
    this.updateAffectiveResonances();

    // Apply personality trait influences
    this.applyPersonalityInfluences();

    // Store in history
    this.emotionHistory.push({ ...this.currentEmotionalState });
    if (this.emotionHistory.length > this.parameters.memoryWindow) {
      this.emotionHistory.shift();
    }

    this.currentEmotionalState.timestamp = Date.now();
    return { ...this.currentEmotionalState };
  }

  /**
   * Update emotional context
   */
  private updateContext(
    userInput: string,
    detectedUserEmotions: Map<string, number>,
    contextFactors: Partial<Record<string, number>>
  ): void {
    // Add conversation turn
    const turn: ConversationTurn = {
      speaker: 'user',
      content: userInput,
      timestamp: Date.now(),
      detectedEmotions: new Map(detectedUserEmotions),
      sentiment: this.calculateSentiment(userInput)
    };

    this.context.conversationHistory.push(turn);
    if (this.context.conversationHistory.length > this.parameters.memoryWindow) {
      this.context.conversationHistory.shift();
    }

    // Update user emotional state
    this.context.userEmotionalState.dimensions = new Map(detectedUserEmotions);
    this.context.userEmotionalState.intensity = Math.max(...detectedUserEmotions.values());
    this.context.userEmotionalState.valence = turn.sentiment;
    this.context.userEmotionalState.timestamp = Date.now();

    // Update environmental factors
    Object.entries(contextFactors).forEach(([factor, value]) => {
      this.context.environmentalFactors.set(factor, value);
    });

    this.context.conversationLength = this.context.conversationHistory.length;
    this.context.timeOfDay = new Date().getHours();
  }

  /**
   * Calculate sentiment from text
   */
  private calculateSentiment(text: string): number {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['good', 'great', 'awesome', 'excellent', 'love', 'like', 'amazing', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'horrible', 'worst', 'sad'];

    const words = text.toLowerCase().split(/\s+/);
    let sentiment = 0;

    words.forEach(word => {
      if (positiveWords.some(pos => word.includes(pos))) sentiment += 0.1;
      if (negativeWords.some(neg => word.includes(neg))) sentiment -= 0.1;
    });

    return Math.max(-1, Math.min(1, sentiment));
  }

  /**
   * Apply differential emotion dynamics
   */
  private applyDifferentialEmotionDynamics(): void {
    const dt = 0.1; // time step
    
    // Emotion decay
    this.currentEmotionalState.dimensions.forEach((value, emotion) => {
      const decayedValue = value * (1 - this.parameters.decayRate * dt);
      this.currentEmotionalState.dimensions.set(emotion, decayedValue);
    });

    // Emotional contagion from user
    this.context.userEmotionalState.dimensions.forEach((userValue, emotion) => {
      const currentValue = this.currentEmotionalState.dimensions.get(emotion) || 0;
      const contagionRate = 0.3; // How much we mirror user emotions
      const newValue = currentValue + contagionRate * userValue * dt;
      this.currentEmotionalState.dimensions.set(emotion, Math.max(0, Math.min(1, newValue)));
    });

    // Update composite measures
    this.updateCompositeMeasures();
  }

  /**
   * Update composite emotional measures
   */
  private updateCompositeMeasures(): void {
    const emotions = Array.from(this.currentEmotionalState.dimensions.values());
    
    // Intensity as maximum emotion value
    this.currentEmotionalState.intensity = Math.max(...emotions);

    // Valence as weighted positive/negative emotions
    const positiveEmotions = ['joy', 'trust', 'anticipation', 'curiosity', 'enthusiasm'];
    const negativeEmotions = ['sadness', 'anger', 'fear', 'disgust'];

    let positive = 0, negative = 0;
    positiveEmotions.forEach(emotion => {
      positive += this.currentEmotionalState.dimensions.get(emotion) || 0;
    });
    negativeEmotions.forEach(emotion => {
      negative += this.currentEmotionalState.dimensions.get(emotion) || 0;
    });

    this.currentEmotionalState.valence = (positive - negative) / (positive + negative + 0.001);

    // Arousal as activity level
    const activeEmotions = ['anger', 'fear', 'surprise', 'enthusiasm'];
    let arousal = 0;
    activeEmotions.forEach(emotion => {
      arousal += this.currentEmotionalState.dimensions.get(emotion) || 0;
    });
    this.currentEmotionalState.arousal = arousal / activeEmotions.length;

    // Dominance as control feeling
    const dominantEmotions = ['anger', 'joy', 'anticipation'];
    let dominance = 0;
    dominantEmotions.forEach(emotion => {
      dominance += this.currentEmotionalState.dimensions.get(emotion) || 0;
    });
    this.currentEmotionalState.dominance = dominance / dominantEmotions.length;
  }

  /**
   * Update affective resonances
   */
  private updateAffectiveResonances(): void {
    const time = Date.now() / 1000; // Convert to seconds

    this.affectiveResonances.forEach((resonance, name) => {
      // Update phase based on emotional state
      const emotionInfluence = this.getEmotionInfluenceForResonance(name);
      resonance.phase += resonance.frequency * 0.1 + emotionInfluence * 0.05;

      // Update amplitude based on emotional intensity
      const targetAmplitude = this.currentEmotionalState.intensity * 0.5;
      resonance.amplitude += (targetAmplitude - resonance.amplitude) * 0.1;

      // Compute resonance value
      const resonanceValue = resonance.amplitude * Math.sin(resonance.phase);
      
      // Apply resonance to corresponding emotion
      const emotionName = this.getEmotionForResonance(name);
      if (emotionName) {
        const currentValue = this.currentEmotionalState.dimensions.get(emotionName) || 0;
        const newValue = currentValue + resonanceValue * 0.1;
        this.currentEmotionalState.dimensions.set(emotionName, Math.max(0, Math.min(1, newValue)));
      }
    });
  }

  /**
   * Get emotion influence for a specific resonance
   */
  private getEmotionInfluenceForResonance(resonanceName: string): number {
    const mapping: Record<string, string> = {
      'empathy_resonance': 'empathy',
      'curiosity_resonance': 'curiosity',
      'joy_resonance': 'joy',
      'calm_resonance': 'calmness',
      'analytical_resonance': 'focus'
    };

    const emotionName = mapping[resonanceName];
    return emotionName ? (this.currentEmotionalState.dimensions.get(emotionName) || 0) : 0;
  }

  /**
   * Get emotion name for a resonance
   */
  private getEmotionForResonance(resonanceName: string): string | null {
    const mapping: Record<string, string> = {
      'empathy_resonance': 'empathy',
      'curiosity_resonance': 'curiosity',
      'joy_resonance': 'joy',
      'calm_resonance': 'calmness',
      'analytical_resonance': 'focus'
    };

    return mapping[resonanceName] || null;
  }

  /**
   * Apply personality trait influences
   */
  private applyPersonalityInfluences(): void {
    this.emotionMappings.forEach(mapping => {
      const trait = this.personalityTraits.get(mapping.traitName);
      if (!trait) return;

      const influenceValue = mapping.mappingFunction(trait.value, this.context);
      const currentValue = this.currentEmotionalState.dimensions.get(mapping.emotionDimension) || 0;
      
      const newValue = currentValue + influenceValue * mapping.weight * trait.influence * 0.1;
      this.currentEmotionalState.dimensions.set(
        mapping.emotionDimension, 
        Math.max(0, Math.min(1, newValue))
      );
    });
  }

  /**
   * Map emotional state to reservoir parameters
   */
  public mapToReservoirParameters(): Map<string, number> {
    const parameters = new Map<string, number>();

    // Map emotions to reservoir properties
    parameters.set('leaking_rate', 0.3 + this.currentEmotionalState.arousal * 0.4);
    parameters.set('spectral_radius', 0.8 + this.currentEmotionalState.intensity * 0.4);
    parameters.set('input_scaling', 0.5 + this.currentEmotionalState.valence * 0.3);
    parameters.set('noise_level', this.currentEmotionalState.dimensions.get('anxiety') || 0.1);
    
    // Map personality traits
    this.personalityTraits.forEach((trait, name) => {
      parameters.set(`trait_${name}`, trait.value);
    });

    // Map resonance frequencies
    this.affectiveResonances.forEach((resonance, name) => {
      parameters.set(`resonance_${name}_freq`, resonance.frequency);
      parameters.set(`resonance_${name}_amp`, resonance.amplitude);
    });

    return parameters;
  }

  /**
   * Generate emotional response text
   */
  public generateEmotionalResponse(baseResponse: string): string {
    const emotionalModifiers = this.getEmotionalModifiers();
    
    let modifiedResponse = baseResponse;

    // Apply emotional coloring
    if (this.currentEmotionalState.valence > 0.3) {
      modifiedResponse = this.addPositiveEmotionalTone(modifiedResponse);
    } else if (this.currentEmotionalState.valence < -0.3) {
      modifiedResponse = this.addNegativeEmotionalTone(modifiedResponse);
    }

    // Apply personality-based modifications
    if (this.personalityTraits.get('enthusiasm')?.value > 0.5) {
      modifiedResponse = this.addEnthusiasm(modifiedResponse);
    }

    if (this.personalityTraits.get('empathy')?.value > 0.7) {
      modifiedResponse = this.addEmpathy(modifiedResponse);
    }

    return modifiedResponse;
  }

  /**
   * Get current emotional modifiers
   */
  private getEmotionalModifiers(): Map<string, number> {
    const modifiers = new Map<string, number>();
    
    // Dominant emotions influence response style
    const dominantEmotion = this.getDominantEmotion();
    modifiers.set('dominant_emotion', dominantEmotion.value);
    modifiers.set('emotional_intensity', this.currentEmotionalState.intensity);
    modifiers.set('valence', this.currentEmotionalState.valence);

    return modifiers;
  }

  /**
   * Get the dominant emotion
   */
  private getDominantEmotion(): { name: string; value: number } {
    let maxEmotion = { name: 'neutral', value: 0 };
    
    this.currentEmotionalState.dimensions.forEach((value, emotion) => {
      if (value > maxEmotion.value) {
        maxEmotion = { name: emotion, value };
      }
    });

    return maxEmotion;
  }

  /**
   * Add positive emotional tone
   */
  private addPositiveEmotionalTone(text: string): string {
    // Add enthusiasm markers
    if (Math.random() < 0.3) {
      text = text.replace(/\.$/, '!');
    }
    
    // Add positive reinforcement
    const positiveMarkers = ['Great!', 'Excellent!', 'Wonderful!', 'I\'m excited to help!'];
    if (Math.random() < 0.2) {
      return positiveMarkers[Math.floor(Math.random() * positiveMarkers.length)] + ' ' + text;
    }

    return text;
  }

  /**
   * Add negative emotional tone (more subdued)
   */
  private addNegativeEmotionalTone(text: string): string {
    // Make more cautious and empathetic
    if (text.startsWith('I ')) {
      text = 'I understand this might be challenging, and ' + text.toLowerCase();
    }

    return text;
  }

  /**
   * Add enthusiasm to response
   */
  private addEnthusiasm(text: string): string {
    const enthusiasticWords = ['definitely', 'absolutely', 'certainly', 'fantastic'];
    const word = enthusiasticWords[Math.floor(Math.random() * enthusiasticWords.length)];
    
    if (Math.random() < 0.3) {
      text = text.replace(/\b(yes|sure|okay)\b/gi, word);
    }

    return text;
  }

  /**
   * Add empathy to response
   */
  private addEmpathy(text: string): string {
    const empatheticPhrases = [
      'I can understand how you feel',
      'That sounds challenging',
      'I appreciate you sharing that',
      'I hear what you\'re saying'
    ];

    if (this.context.userEmotionalState.valence < 0 && Math.random() < 0.4) {
      const phrase = empatheticPhrases[Math.floor(Math.random() * empatheticPhrases.length)];
      return phrase + '. ' + text;
    }

    return text;
  }

  /**
   * Get current emotional state
   */
  public getCurrentEmotionalState(): EmotionalState {
    return { ...this.currentEmotionalState };
  }

  /**
   * Get personality traits
   */
  public getPersonalityTraits(): Map<string, PersonaTrait> {
    return new Map(this.personalityTraits);
  }

  /**
   * Update personality trait
   */
  public updatePersonalityTrait(name: string, value: number): void {
    const trait = this.personalityTraits.get(name);
    if (trait) {
      trait.value = Math.max(-1, Math.min(1, value));
    }
  }

  /**
   * Get affective resonances
   */
  public getAffectiveResonances(): Map<string, AffectiveResonance> {
    return new Map(this.affectiveResonances);
  }

  /**
   * Export emotional profile
   */
  public exportEmotionalProfile(): any {
    return {
      currentState: this.currentEmotionalState,
      personalityTraits: Object.fromEntries(this.personalityTraits),
      affectiveResonances: Object.fromEntries(this.affectiveResonances),
      parameters: this.parameters,
      emotionHistory: this.emotionHistory.slice(-5), // Last 5 states
      context: {
        ...this.context,
        conversationHistory: this.context.conversationHistory.slice(-3) // Last 3 turns
      }
    };
  }

  /**
   * Import emotional profile
   */
  public importEmotionalProfile(profile: any): void {
    this.currentEmotionalState = profile.currentState;
    this.personalityTraits = new Map(Object.entries(profile.personalityTraits));
    this.affectiveResonances = new Map(Object.entries(profile.affectiveResonances));
    this.parameters = { ...this.parameters, ...profile.parameters };
    this.emotionHistory = profile.emotionHistory || [];
    this.context = { ...this.context, ...profile.context };
  }
}