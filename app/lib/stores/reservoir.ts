/**
 * Reservoir Computing Store
 * Integrates Deep Tree Echo State Network with bolt.new workbench
 */

import { atom, map, type WritableAtom } from 'nanostores';
import { DeepTreeEchoSelf, type DeepTreeEchoConfig, type EchoSelfState } from '../reservoir';

export interface ReservoirConfig {
  enabled: boolean;
  adaptivePersona: boolean;
  emotionalResonance: boolean;
  ricciFlowEnabled: boolean;
  reservoirSize: number;
  maxDepth: number;
  membraneCount: number;
}

export interface ReservoirMetrics {
  coherence: number;
  energy: number;
  emotionalIntensity: number;
  attentionFocus: string[];
  personalityTraits: Record<string, number>;
  resonancePatterns: Record<string, number>;
}

export class ReservoirStore {
  #echoSelf: DeepTreeEchoSelf | null = null;
  #isInitialized = false;

  config: WritableAtom<ReservoirConfig> = import.meta.hot?.data.reservoirConfig ?? atom({
    enabled: true,
    adaptivePersona: true,
    emotionalResonance: true,
    ricciFlowEnabled: false, // Disabled by default for performance
    reservoirSize: 150,
    maxDepth: 3,
    membraneCount: 6
  });

  state: WritableAtom<EchoSelfState | null> = import.meta.hot?.data.reservoirState ?? atom(null);
  metrics: WritableAtom<ReservoirMetrics> = import.meta.hot?.data.reservoirMetrics ?? atom({
    coherence: 0,
    energy: 0,
    emotionalIntensity: 0,
    attentionFocus: [],
    personalityTraits: {},
    resonancePatterns: {}
  });

  isActive: WritableAtom<boolean> = import.meta.hot?.data.reservoirActive ?? atom(false);
  lastInteraction: WritableAtom<number> = import.meta.hot?.data.lastInteraction ?? atom(0);

  constructor() {
    if (import.meta.hot) {
      import.meta.hot.data.reservoirConfig = this.config;
      import.meta.hot.data.reservoirState = this.state;
      import.meta.hot.data.reservoirMetrics = this.metrics;
      import.meta.hot.data.reservoirActive = this.isActive;
      import.meta.hot.data.lastInteraction = this.lastInteraction;
    }

    this.initialize();
  }

  /**
   * Initialize the reservoir computing system
   */
  private async initialize(): Promise<void> {
    if (this.#isInitialized || !this.config.get().enabled) {
      return;
    }

    try {
      const config = this.config.get();
      const echoConfig: DeepTreeEchoConfig = {
        reservoirSize: config.reservoirSize,
        maxDepth: config.maxDepth,
        emotionalSensitivity: config.emotionalResonance ? 0.7 : 0.3,
        adaptationRate: config.adaptivePersona ? 0.05 : 0.01,
        resonanceFrequency: 1.2,
        membraneCount: config.membraneCount,
        ricciFlowEnabled: config.ricciFlowEnabled,
        juliaIntegration: config.ricciFlowEnabled
      };

      this.#echoSelf = new DeepTreeEchoSelf(echoConfig);
      this.#isInitialized = true;
      this.isActive.set(true);

      // Update initial state and metrics
      this.updateStateAndMetrics();

      console.log('🧠 Deep Tree Echo State Network initialized');
    } catch (error) {
      console.error('Failed to initialize reservoir computing:', error);
      this.isActive.set(false);
    }
  }

  /**
   * Process chat input through the reservoir system
   */
  public async processChat(
    userMessage: string,
    context: any = {},
    detectedEmotions: Map<string, number> = new Map()
  ): Promise<{
    enhancedMessage: string;
    emotionalContext: any;
    attentionTargets: string[];
    confidence: number;
    reservoirState: any;
  }> {
    if (!this.#isInitialized || !this.config.get().enabled) {
      return {
        enhancedMessage: userMessage,
        emotionalContext: {},
        attentionTargets: [],
        confidence: 0.5,
        reservoirState: null
      };
    }

    try {
      const result = await this.#echoSelf!.processInput(userMessage, context, detectedEmotions);
      
      this.lastInteraction.set(Date.now());
      this.updateStateAndMetrics();

      return {
        enhancedMessage: result.response,
        emotionalContext: result.emotionalState,
        attentionTargets: result.attention,
        confidence: result.confidence,
        reservoirState: result.reservoirState
      };
    } catch (error) {
      console.error('Reservoir processing error:', error);
      return {
        enhancedMessage: userMessage,
        emotionalContext: {},
        attentionTargets: [],
        confidence: 0.3,
        reservoirState: null
      };
    }
  }

  /**
   * Update emotional context for code generation
   */
  public updateEmotionalContext(
    userIntent: string,
    codeComplexity: number,
    userFrustration: number
  ): void {
    if (!this.#isInitialized || !this.config.get().enabled) {
      return;
    }

    const emotions = new Map<string, number>();
    
    // Map code context to emotions
    if (codeComplexity > 0.7) {
      emotions.set('analytical', 0.8);
      emotions.set('focus', 0.9);
    }
    
    if (userFrustration > 0.5) {
      emotions.set('empathy', 0.8);
      emotions.set('patience', 0.9);
    }

    if (userIntent.includes('creative') || userIntent.includes('design')) {
      emotions.set('creativity', 0.7);
      emotions.set('curiosity', 0.6);
    }

    // Process through emotion framework
    try {
      this.#echoSelf!.processInput(userIntent, { 
        codeComplexity, 
        userFrustration 
      }, emotions);
      
      this.updateStateAndMetrics();
    } catch (error) {
      console.error('Error updating emotional context:', error);
    }
  }

  /**
   * Get personality-adjusted parameters for AI responses
   */
  public getPersonalityParameters(): Record<string, number> {
    if (!this.#isInitialized || !this.config.get().enabled) {
      return {
        helpfulness: 0.8,
        creativity: 0.5,
        analytical: 0.6,
        empathy: 0.7,
        enthusiasm: 0.5
      };
    }

    const state = this.#echoSelf!.getCurrentState();
    const traits: Record<string, number> = {};

    state.persona.forEach((trait, name) => {
      traits[name] = trait.value;
    });

    return traits;
  }

  /**
   * Get current attention targets for UI guidance
   */
  public getAttentionTargets(): string[] {
    if (!this.#isInitialized || !this.config.get().enabled) {
      return [];
    }

    const attentionState = this.#echoSelf!.getAttentionState();
    return attentionState.focusTargets.slice(0, 5);
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ReservoirConfig>): void {
    const currentConfig = this.config.get();
    const updatedConfig = { ...currentConfig, ...newConfig };
    this.config.set(updatedConfig);

    // Reinitialize if needed
    if (newConfig.enabled && !this.#isInitialized) {
      this.initialize();
    } else if (!newConfig.enabled && this.#isInitialized) {
      this.shutdown();
    }
  }

  /**
   * Shutdown reservoir system
   */
  public shutdown(): void {
    this.#echoSelf = null;
    this.#isInitialized = false;
    this.isActive.set(false);
    this.state.set(null);
  }

  /**
   * Update state and metrics
   */
  private updateStateAndMetrics(): void {
    if (!this.#echoSelf) return;

    const currentState = this.#echoSelf.getCurrentState();
    const resonanceState = this.#echoSelf.getResonanceState();
    const attentionState = this.#echoSelf.getAttentionState();

    this.state.set(currentState);

    // Update metrics
    const personalityTraits: Record<string, number> = {};
    currentState.persona.forEach((trait, name) => {
      personalityTraits[name] = trait.value;
    });

    const resonancePatterns: Record<string, number> = {};
    resonanceState.resonancePatterns.forEach((value, pattern) => {
      resonancePatterns[pattern] = value;
    });

    this.metrics.set({
      coherence: currentState.coherence,
      energy: currentState.energy,
      emotionalIntensity: currentState.emotional.intensity,
      attentionFocus: attentionState.focusTargets.slice(0, 3),
      personalityTraits,
      resonancePatterns
    });
  }

  /**
   * Get reservoir insights for debugging
   */
  public getInsights(): any {
    if (!this.#isInitialized || !this.#echoSelf) {
      return null;
    }

    return {
      systemState: this.#echoSelf.exportSystemState(),
      currentMetrics: this.metrics.get(),
      isActive: this.isActive.get(),
      lastInteraction: this.lastInteraction.get(),
      config: this.config.get()
    };
  }

  /**
   * Export state for persistence
   */
  public exportState(): any {
    if (!this.#echoSelf) return null;
    
    return {
      systemState: this.#echoSelf.exportSystemState(),
      config: this.config.get(),
      metrics: this.metrics.get(),
      timestamp: Date.now()
    };
  }

  /**
   * Import state from persistence
   */
  public importState(savedState: any): void {
    if (!savedState || !this.#echoSelf) return;

    try {
      this.#echoSelf.importSystemState(savedState.systemState);
      this.config.set(savedState.config);
      this.metrics.set(savedState.metrics);
      this.updateStateAndMetrics();
    } catch (error) {
      console.error('Error importing reservoir state:', error);
    }
  }
}

export const reservoirStore = new ReservoirStore();