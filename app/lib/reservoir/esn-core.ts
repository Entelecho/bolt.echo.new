/**
 * Deep Tree Echo State Network (ESN) Core Implementation
 * Implements reservoir computing with hierarchical tree structure
 */

export interface ESNNode {
  id: string;
  state: number[];
  weights: number[][];
  bias: number[];
  leakingRate: number;
  spectralRadius: number;
  inputScaling: number;
  children: ESNNode[];
  parent?: ESNNode;
}

export interface ReservoirState {
  nodes: Map<string, ESNNode>;
  globalState: number[];
  timestamp: number;
  energy: number;
}

export class DeepTreeESN {
  private reservoir: ReservoirState;
  private readonly maxDepth: number;
  private readonly reservoirSize: number;
  private readonly inputDimension: number;
  private readonly outputDimension: number;

  constructor(
    reservoirSize: number = 100,
    inputDimension: number = 10,
    outputDimension: number = 5,
    maxDepth: number = 3
  ) {
    this.reservoirSize = reservoirSize;
    this.inputDimension = inputDimension;
    this.outputDimension = outputDimension;
    this.maxDepth = maxDepth;
    
    this.reservoir = {
      nodes: new Map(),
      globalState: new Array(reservoirSize).fill(0),
      timestamp: Date.now(),
      energy: 0
    };

    this.initializeReservoir();
  }

  /**
   * Initialize the hierarchical tree reservoir structure
   */
  private initializeReservoir(): void {
    const rootNode = this.createESNNode('root', 0);
    this.reservoir.nodes.set('root', rootNode);
    this.buildTreeStructure(rootNode, 1);
  }

  /**
   * Create a single ESN node with random initialization
   */
  private createESNNode(id: string, depth: number): ESNNode {
    const nodeSize = Math.floor(this.reservoirSize / Math.pow(2, depth));
    
    return {
      id,
      state: new Array(nodeSize).fill(0).map(() => Math.random() * 0.1),
      weights: this.generateRandomMatrix(nodeSize, nodeSize, 0.9),
      bias: new Array(nodeSize).fill(0).map(() => (Math.random() - 0.5) * 0.1),
      leakingRate: 0.3 + Math.random() * 0.4, // 0.3 to 0.7
      spectralRadius: 0.8 + Math.random() * 0.4, // 0.8 to 1.2
      inputScaling: 0.5 + Math.random() * 0.5, // 0.5 to 1.0
      children: [],
      parent: undefined
    };
  }

  /**
   * Generate random matrix with spectral radius normalization
   */
  private generateRandomMatrix(rows: number, cols: number, spectralRadius: number): number[][] {
    const matrix = Array(rows).fill(0).map(() => 
      Array(cols).fill(0).map(() => (Math.random() - 0.5) * 2)
    );

    // Normalize to desired spectral radius
    const eigenvalueApprox = Math.sqrt(rows * cols) * 0.5;
    const scale = spectralRadius / eigenvalueApprox;
    
    return matrix.map(row => row.map(val => val * scale));
  }

  /**
   * Build hierarchical tree structure recursively
   */
  private buildTreeStructure(parent: ESNNode, depth: number): void {
    if (depth >= this.maxDepth) return;

    const childCount = 2 + Math.floor(Math.random() * 3); // 2-4 children
    
    for (let i = 0; i < childCount; i++) {
      const childId = `${parent.id}_${i}`;
      const child = this.createESNNode(childId, depth);
      child.parent = parent;
      
      parent.children.push(child);
      this.reservoir.nodes.set(childId, child);
      
      this.buildTreeStructure(child, depth + 1);
    }
  }

  /**
   * Update reservoir state with new input
   */
  public updateState(input: number[]): ReservoirState {
    this.reservoir.timestamp = Date.now();
    
    // Process input through tree hierarchy
    const rootNode = this.reservoir.nodes.get('root')!;
    this.propagateInput(rootNode, input);
    
    // Update global state
    this.updateGlobalState();
    
    return { ...this.reservoir };
  }

  /**
   * Propagate input through tree structure
   */
  private propagateInput(node: ESNNode, input: number[]): void {
    // Update current node state using ESN dynamics
    const newState = this.computeESNUpdate(node, input);
    node.state = newState;

    // Propagate to children with transformed input
    if (node.children.length > 0) {
      const childInput = this.transformForChildren(node.state, input);
      node.children.forEach(child => this.propagateInput(child, childInput));
    }
  }

  /**
   * Compute ESN state update using standard reservoir dynamics
   */
  private computeESNUpdate(node: ESNNode, input: number[]): number[] {
    const { state, weights, bias, leakingRate, inputScaling } = node;
    const stateSize = state.length;
    const inputSize = Math.min(input.length, stateSize);

    // Compute reservoir activation
    const activation = new Array(stateSize).fill(0);
    
    // Reservoir internal connections
    for (let i = 0; i < stateSize; i++) {
      for (let j = 0; j < stateSize; j++) {
        activation[i] += weights[i][j] * state[j];
      }
    }

    // Input connections
    for (let i = 0; i < inputSize; i++) {
      activation[i] += inputScaling * input[i];
    }

    // Add bias and apply activation function (tanh)
    const newState = new Array(stateSize);
    for (let i = 0; i < stateSize; i++) {
      const preActivation = activation[i] + bias[i];
      const activated = Math.tanh(preActivation);
      
      // Leaky integration
      newState[i] = (1 - leakingRate) * state[i] + leakingRate * activated;
    }

    return newState;
  }

  /**
   * Transform state for child nodes
   */
  private transformForChildren(parentState: number[], originalInput: number[]): number[] {
    // Create a mixed representation for children
    const mixedSize = Math.min(parentState.length, originalInput.length);
    const childInput = new Array(mixedSize);
    
    for (let i = 0; i < mixedSize; i++) {
      childInput[i] = 0.7 * parentState[i] + 0.3 * originalInput[i];
    }
    
    return childInput;
  }

  /**
   * Update global reservoir state by aggregating all nodes
   */
  private updateGlobalState(): void {
    const globalState = new Array(this.reservoirSize).fill(0);
    let index = 0;

    // Aggregate states from all nodes in tree order
    this.reservoir.nodes.forEach(node => {
      for (let i = 0; i < node.state.length && index < this.reservoirSize; i++) {
        globalState[index++] = node.state[i];
      }
    });

    this.reservoir.globalState = globalState;
    
    // Compute energy as sum of squared activations
    this.reservoir.energy = globalState.reduce((sum, val) => sum + val * val, 0);
  }

  /**
   * Get current reservoir state
   */
  public getState(): ReservoirState {
    return { ...this.reservoir };
  }

  /**
   * Get specific node by ID
   */
  public getNode(nodeId: string): ESNNode | undefined {
    return this.reservoir.nodes.get(nodeId);
  }

  /**
   * Get all leaf nodes (nodes without children)
   */
  public getLeafNodes(): ESNNode[] {
    return Array.from(this.reservoir.nodes.values()).filter(node => node.children.length === 0);
  }

  /**
   * Reset reservoir to initial state
   */
  public reset(): void {
    this.reservoir.nodes.forEach(node => {
      node.state.fill(0);
    });
    this.reservoir.globalState.fill(0);
    this.reservoir.energy = 0;
  }

  /**
   * Export reservoir configuration for persistence
   */
  public exportConfig(): any {
    return {
      reservoirSize: this.reservoirSize,
      inputDimension: this.inputDimension,
      outputDimension: this.outputDimension,
      maxDepth: this.maxDepth,
      nodes: Array.from(this.reservoir.nodes.entries()).map(([id, node]) => ({
        id,
        weights: node.weights,
        bias: node.bias,
        leakingRate: node.leakingRate,
        spectralRadius: node.spectralRadius,
        inputScaling: node.inputScaling,
        parentId: node.parent?.id
      }))
    };
  }
}