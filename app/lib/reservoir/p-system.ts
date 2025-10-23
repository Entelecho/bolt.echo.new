/**
 * Paun P-System Membrane Computing Reservoir Evolution
 * Implements evolutionary membrane structures for reservoir optimization
 */

import type { ESNNode, ReservoirState } from './esn-core';

export interface Membrane {
  id: string;
  label: string;
  parentId?: string;
  children: string[];
  objects: Map<string, number>; // object type -> quantity
  rules: MembraneRule[];
  permeability: number; // 0-1, how easily objects pass through
  charge: number; // electrical charge for membrane dynamics
  thickness: number; // affects rule execution priority
}

export interface MembraneRule {
  id: string;
  input: Map<string, number>; // required objects
  output: Map<string, number>; // produced objects
  targetMembrane?: string; // where output goes
  priority: number;
  probability: number; // 0-1, execution probability
  condition?: (membrane: Membrane, context: PSystemState) => boolean;
}

export interface PSystemState {
  membranes: Map<string, Membrane>;
  globalObjects: Map<string, number>;
  evolutionStep: number;
  energy: number;
  configuration: string; // serialized state
}

export interface EvolutionParameters {
  mutationRate: number;
  crossoverRate: number;
  populationSize: number;
  eliteSize: number;
  maxGenerations: number;
  fitnessThreshold: number;
}

export class PSystemMembraneEvolution {
  private pSystem: PSystemState;
  private evolutionParams: EvolutionParameters;
  private population: PSystemState[];
  private fitnessScores: number[];
  private generation: number;

  constructor(
    initialMembranes: number = 5,
    evolutionParams: Partial<EvolutionParameters> = {}
  ) {
    this.evolutionParams = {
      mutationRate: 0.1,
      crossoverRate: 0.8,
      populationSize: 50,
      eliteSize: 10,
      maxGenerations: 100,
      fitnessThreshold: 0.95,
      ...evolutionParams
    };

    this.pSystem = {
      membranes: new Map(),
      globalObjects: new Map(),
      evolutionStep: 0,
      energy: 0,
      configuration: ''
    };

    this.population = [];
    this.fitnessScores = [];
    this.generation = 0;

    this.initializePSystem(initialMembranes);
    this.initializePopulation();
  }

  /**
   * Initialize the P-System with basic membrane structure
   */
  private initializePSystem(membraneCount: number): void {
    // Create root membrane (skin membrane)
    const rootMembrane: Membrane = {
      id: 'root',
      label: 'skin',
      children: [],
      objects: new Map([
        ['energy', 100],
        ['information', 50],
        ['catalyst', 10]
      ]),
      rules: this.generateBasicRules('root'),
      permeability: 0.8,
      charge: 0,
      thickness: 1.0
    };

    this.pSystem.membranes.set('root', rootMembrane);

    // Create child membranes
    for (let i = 0; i < membraneCount - 1; i++) {
      const membraneId = `membrane_${i}`;
      const membrane: Membrane = {
        id: membraneId,
        label: `m${i}`,
        parentId: 'root',
        children: [],
        objects: new Map([
          ['data', Math.floor(Math.random() * 20) + 5],
          ['processor', Math.floor(Math.random() * 5) + 1],
          ['memory', Math.floor(Math.random() * 10) + 3]
        ]),
        rules: this.generateBasicRules(membraneId),
        permeability: 0.3 + Math.random() * 0.4,
        charge: (Math.random() - 0.5) * 2,
        thickness: 0.5 + Math.random() * 0.5
      };

      this.pSystem.membranes.set(membraneId, membrane);
      rootMembrane.children.push(membraneId);
    }

    this.updateConfiguration();
  }

  /**
   * Generate basic membrane rules
   */
  private generateBasicRules(membraneId: string): MembraneRule[] {
    const rules: MembraneRule[] = [];

    // Data processing rule
    rules.push({
      id: `${membraneId}_process`,
      input: new Map([['data', 2], ['processor', 1]]),
      output: new Map([['information', 1], ['energy', 3]]),
      priority: 1,
      probability: 0.8
    });

    // Memory allocation rule
    rules.push({
      id: `${membraneId}_allocate`,
      input: new Map([['memory', 1], ['information', 1]]),
      output: new Map([['processed_data', 1]]),
      priority: 2,
      probability: 0.7
    });

    // Catalytic enhancement rule
    rules.push({
      id: `${membraneId}_catalyze`,
      input: new Map([['catalyst', 1], ['data', 1]]),
      output: new Map([['enhanced_data', 2], ['catalyst', 1]]),
      priority: 3,
      probability: 0.6
    });

    // Communication rule (send to parent)
    rules.push({
      id: `${membraneId}_communicate`,
      input: new Map([['information', 2]]),
      output: new Map([['message', 1]]),
      targetMembrane: membraneId === 'root' ? undefined : 'root',
      priority: 0,
      probability: 0.5
    });

    return rules;
  }

  /**
   * Execute one evolution step of the P-System
   */
  public evolveStep(): PSystemState {
    this.pSystem.evolutionStep++;

    // Execute rules for each membrane
    this.pSystem.membranes.forEach(membrane => {
      this.executeMembraneRules(membrane);
    });

    // Update membrane charges and permeabilities
    this.updateMembraneDynamics();

    // Calculate system energy
    this.calculateSystemEnergy();

    this.updateConfiguration();

    return { ...this.pSystem };
  }

  /**
   * Execute rules within a membrane
   */
  private executeMembraneRules(membrane: Membrane): void {
    // Sort rules by priority (higher priority first)
    const sortedRules = [...membrane.rules].sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      // Check if rule can be executed
      if (Math.random() > rule.probability) continue;

      // Check if required objects are available
      const canExecute = Array.from(rule.input.entries()).every(([objType, required]) => {
        const available = membrane.objects.get(objType) || 0;
        return available >= required;
      });

      if (!canExecute) continue;

      // Check custom condition if present
      if (rule.condition && !rule.condition(membrane, this.pSystem)) continue;

      // Execute rule
      this.executeRule(membrane, rule);
    }
  }

  /**
   * Execute a specific rule
   */
  private executeRule(membrane: Membrane, rule: MembraneRule): void {
    // Consume input objects
    rule.input.forEach((quantity, objType) => {
      const current = membrane.objects.get(objType) || 0;
      membrane.objects.set(objType, Math.max(0, current - quantity));
    });

    // Produce output objects
    const targetMembrane = rule.targetMembrane ? 
      this.pSystem.membranes.get(rule.targetMembrane) : membrane;

    if (targetMembrane) {
      rule.output.forEach((quantity, objType) => {
        const current = targetMembrane.objects.get(objType) || 0;
        targetMembrane.objects.set(objType, current + quantity);
      });
    }
  }

  /**
   * Update membrane dynamics (charge, permeability)
   */
  private updateMembraneDynamics(): void {
    this.pSystem.membranes.forEach(membrane => {
      // Update charge based on object concentrations
      const totalObjects = Array.from(membrane.objects.values()).reduce((sum, count) => sum + count, 0);
      const chargeInfluence = (totalObjects - 10) * 0.01;
      membrane.charge = Math.max(-2, Math.min(2, membrane.charge + chargeInfluence));

      // Update permeability based on charge
      const basePermeability = 0.5;
      membrane.permeability = basePermeability + membrane.charge * 0.1;
      membrane.permeability = Math.max(0.1, Math.min(0.9, membrane.permeability));
    });
  }

  /**
   * Calculate total system energy
   */
  private calculateSystemEnergy(): void {
    let totalEnergy = 0;

    this.pSystem.membranes.forEach(membrane => {
      // Energy from objects
      const objectEnergy = Array.from(membrane.objects.values()).reduce((sum, count) => sum + count, 0);
      
      // Energy from membrane properties
      const membraneEnergy = membrane.charge * membrane.charge + membrane.permeability * 10;
      
      totalEnergy += objectEnergy + membraneEnergy;
    });

    this.pSystem.energy = totalEnergy;
  }

  /**
   * Update system configuration string
   */
  private updateConfiguration(): void {
    const config = Array.from(this.pSystem.membranes.entries()).map(([id, membrane]) => {
      const objects = Array.from(membrane.objects.entries()).map(([type, count]) => `${type}:${count}`).join(',');
      return `${id}[${objects}]`;
    }).join('|');

    this.pSystem.configuration = config;
  }

  /**
   * Initialize evolution population
   */
  private initializePopulation(): void {
    this.population = [];
    this.fitnessScores = [];

    for (let i = 0; i < this.evolutionParams.populationSize; i++) {
      // Create variation of the base P-System
      const individual = this.createVariation();
      this.population.push(individual);
      this.fitnessScores.push(0);
    }
  }

  /**
   * Create a variation of the current P-System
   */
  private createVariation(): PSystemState {
    const variation: PSystemState = {
      membranes: new Map(),
      globalObjects: new Map(this.pSystem.globalObjects),
      evolutionStep: 0,
      energy: 0,
      configuration: ''
    };

    // Copy and mutate membranes
    this.pSystem.membranes.forEach((membrane, id) => {
      const mutatedMembrane = this.mutateMembrane(membrane);
      variation.membranes.set(id, mutatedMembrane);
    });

    return variation;
  }

  /**
   * Mutate a membrane
   */
  private mutateMembrane(original: Membrane): Membrane {
    const mutated: Membrane = {
      ...original,
      objects: new Map(original.objects),
      rules: [...original.rules],
      children: [...original.children]
    };

    // Mutate permeability
    if (Math.random() < this.evolutionParams.mutationRate) {
      mutated.permeability += (Math.random() - 0.5) * 0.2;
      mutated.permeability = Math.max(0.1, Math.min(0.9, mutated.permeability));
    }

    // Mutate charge
    if (Math.random() < this.evolutionParams.mutationRate) {
      mutated.charge += (Math.random() - 0.5) * 0.5;
      mutated.charge = Math.max(-2, Math.min(2, mutated.charge));
    }

    // Mutate object quantities
    mutated.objects.forEach((count, objType) => {
      if (Math.random() < this.evolutionParams.mutationRate) {
        const change = Math.floor((Math.random() - 0.5) * 6); // -3 to +3
        mutated.objects.set(objType, Math.max(0, count + change));
      }
    });

    return mutated;
  }

  /**
   * Evolve population for one generation
   */
  public evolveGeneration(fitnessFunction: (pSystem: PSystemState) => number): void {
    // Evaluate fitness for all individuals
    for (let i = 0; i < this.population.length; i++) {
      this.fitnessScores[i] = fitnessFunction(this.population[i]);
    }

    // Selection and reproduction
    const newPopulation: PSystemState[] = [];
    
    // Elite selection
    const eliteIndices = this.getEliteIndices();
    eliteIndices.forEach(index => {
      newPopulation.push(this.population[index]);
    });

    // Generate offspring
    while (newPopulation.length < this.evolutionParams.populationSize) {
      const parent1 = this.tournamentSelection();
      const parent2 = this.tournamentSelection();
      
      if (Math.random() < this.evolutionParams.crossoverRate) {
        const offspring = this.crossover(parent1, parent2);
        newPopulation.push(offspring);
      } else {
        newPopulation.push(Math.random() < 0.5 ? parent1 : parent2);
      }
    }

    this.population = newPopulation.slice(0, this.evolutionParams.populationSize);
    this.generation++;
  }

  /**
   * Get indices of elite individuals
   */
  private getEliteIndices(): number[] {
    const indices = Array.from({ length: this.fitnessScores.length }, (_, i) => i);
    indices.sort((a, b) => this.fitnessScores[b] - this.fitnessScores[a]);
    return indices.slice(0, this.evolutionParams.eliteSize);
  }

  /**
   * Tournament selection
   */
  private tournamentSelection(): PSystemState {
    const tournamentSize = 3;
    let bestIndex = Math.floor(Math.random() * this.population.length);
    let bestFitness = this.fitnessScores[bestIndex];

    for (let i = 1; i < tournamentSize; i++) {
      const index = Math.floor(Math.random() * this.population.length);
      if (this.fitnessScores[index] > bestFitness) {
        bestIndex = index;
        bestFitness = this.fitnessScores[index];
      }
    }

    return this.population[bestIndex];
  }

  /**
   * Crossover two P-Systems
   */
  private crossover(parent1: PSystemState, parent2: PSystemState): PSystemState {
    const offspring: PSystemState = {
      membranes: new Map(),
      globalObjects: new Map(),
      evolutionStep: 0,
      energy: 0,
      configuration: ''
    };

    // Combine membranes from both parents
    const allMembraneIds = new Set([
      ...parent1.membranes.keys(),
      ...parent2.membranes.keys()
    ]);

    allMembraneIds.forEach(id => {
      const membrane1 = parent1.membranes.get(id);
      const membrane2 = parent2.membranes.get(id);

      if (membrane1 && membrane2) {
        // Combine properties from both membranes
        const combinedMembrane: Membrane = {
          ...membrane1,
          permeability: (membrane1.permeability + membrane2.permeability) / 2,
          charge: (membrane1.charge + membrane2.charge) / 2,
          objects: new Map()
        };

        // Combine objects
        const allObjectTypes = new Set([
          ...membrane1.objects.keys(),
          ...membrane2.objects.keys()
        ]);

        allObjectTypes.forEach(objType => {
          const count1 = membrane1.objects.get(objType) || 0;
          const count2 = membrane2.objects.get(objType) || 0;
          combinedMembrane.objects.set(objType, Math.floor((count1 + count2) / 2));
        });

        offspring.membranes.set(id, combinedMembrane);
      } else if (membrane1) {
        offspring.membranes.set(id, { ...membrane1 });
      } else if (membrane2) {
        offspring.membranes.set(id, { ...membrane2 });
      }
    });

    return offspring;
  }

  /**
   * Get current P-System state
   */
  public getCurrentState(): PSystemState {
    return { ...this.pSystem };
  }

  /**
   * Get best individual from current population
   */
  public getBestIndividual(): PSystemState {
    const bestIndex = this.fitnessScores.indexOf(Math.max(...this.fitnessScores));
    return this.population[bestIndex];
  }

  /**
   * Get evolution statistics
   */
  public getEvolutionStats() {
    return {
      generation: this.generation,
      bestFitness: Math.max(...this.fitnessScores),
      averageFitness: this.fitnessScores.reduce((sum, f) => sum + f, 0) / this.fitnessScores.length,
      populationSize: this.population.length,
      diversity: this.calculatePopulationDiversity()
    };
  }

  /**
   * Calculate population diversity
   */
  private calculatePopulationDiversity(): number {
    if (this.population.length < 2) return 0;

    let totalDistance = 0;
    let comparisons = 0;

    for (let i = 0; i < this.population.length - 1; i++) {
      for (let j = i + 1; j < this.population.length; j++) {
        totalDistance += this.calculatePSystemDistance(this.population[i], this.population[j]);
        comparisons++;
      }
    }

    return totalDistance / comparisons;
  }

  /**
   * Calculate distance between two P-Systems
   */
  private calculatePSystemDistance(system1: PSystemState, system2: PSystemState): number {
    let distance = 0;
    const allMembraneIds = new Set([...system1.membranes.keys(), ...system2.membranes.keys()]);

    allMembraneIds.forEach(id => {
      const membrane1 = system1.membranes.get(id);
      const membrane2 = system2.membranes.get(id);

      if (membrane1 && membrane2) {
        // Compare membrane properties
        distance += Math.abs(membrane1.permeability - membrane2.permeability);
        distance += Math.abs(membrane1.charge - membrane2.charge);

        // Compare object quantities
        const allObjectTypes = new Set([...membrane1.objects.keys(), ...membrane2.objects.keys()]);
        allObjectTypes.forEach(objType => {
          const count1 = membrane1.objects.get(objType) || 0;
          const count2 = membrane2.objects.get(objType) || 0;
          distance += Math.abs(count1 - count2);
        });
      } else {
        // One membrane exists, the other doesn't
        distance += 10; // penalty for structural difference
      }
    });

    return distance;
  }
}