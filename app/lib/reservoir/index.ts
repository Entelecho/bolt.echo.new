/**
 * Deep Tree Echo State Network Reservoir Computing Framework
 * Export all modules for the AI-powered web development agent
 */

export { DeepTreeESN, type ESNNode, type ReservoirState } from './esn-core';
export { 
  PSystemMembraneEvolution, 
  type PSystemState, 
  type Membrane, 
  type MembraneRule,
  type EvolutionParameters 
} from './p-system';
export { 
  ButcherBSeriesRKRegression, 
  type ButcherTableau, 
  type RootedTree,
  type RKParameters,
  type OptimizationState 
} from './runge-kutta';
export { 
  JuliaSurfaceRicciFlow, 
  type JSurfaceMetric, 
  type RicciFlowParameters,
  type FlowSolution,
  type DifferentialOperator 
} from './julia-ricci';
export { 
  DifferentialEmotionFramework, 
  type EmotionalState, 
  type PersonaTrait,
  type AffectiveResonance,
  type EmotionalContext,
  type DifferentialEmotionParameters 
} from './emotion-framework';
export { 
  DeepTreeEchoSelf, 
  type DeepTreeEchoConfig,
  type EchoSelfState,
  type CognitiveAttentionMechanism,
  type AffectiveResonanceState 
} from './deep-tree-echo';