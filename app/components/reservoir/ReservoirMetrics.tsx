/**
 * Reservoir Metrics Display Component
 * Shows real-time metrics from the Deep Tree Echo State Network
 */

import { useStore } from '@nanostores/react';
import { reservoirStore } from '~/lib/stores/reservoir';
import { memo } from 'react';

interface ReservoirMetricsProps {
  compact?: boolean;
}

export const ReservoirMetrics = memo(({ compact = false }: ReservoirMetricsProps) => {
  const metrics = useStore(reservoirStore.metrics);
  const isActive = useStore(reservoirStore.isActive);
  const config = useStore(reservoirStore.config);

  if (!config.enabled || !isActive) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ 
              backgroundColor: metrics.coherence > 0.7 ? '#10b981' : 
                              metrics.coherence > 0.4 ? '#f59e0b' : '#ef4444'
            }}
          />
          <span>Echo: {(metrics.coherence * 100).toFixed(0)}%</span>
        </div>
        <div className="text-gray-500">|</div>
        <div>Energy: {metrics.energy.toFixed(2)}</div>
        {metrics.attentionFocus.length > 0 && (
          <>
            <div className="text-gray-500">|</div>
            <div>Focus: {metrics.attentionFocus[0]}</div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-200">Deep Tree Echo State</h3>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ 
              backgroundColor: isActive ? '#10b981' : '#6b7280'
            }}
          />
          <span className="text-xs text-gray-400">
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricBar 
          label="Coherence"
          value={metrics.coherence}
          color={metrics.coherence > 0.7 ? '#10b981' : metrics.coherence > 0.4 ? '#f59e0b' : '#ef4444'}
        />
        <MetricBar 
          label="Energy"
          value={Math.min(metrics.energy / 10, 1)} // Normalize energy
          color="#3b82f6"
        />
        <MetricBar 
          label="Emotional"
          value={metrics.emotionalIntensity}
          color="#8b5cf6"
        />
        <MetricBar 
          label="Resonance"
          value={Object.keys(metrics.resonancePatterns).length > 0 ? 
            Object.values(metrics.resonancePatterns).reduce((a, b) => a + b, 0) / Object.keys(metrics.resonancePatterns).length : 
            0}
          color="#06b6d4"
        />
      </div>

      {/* Attention Targets */}
      {metrics.attentionFocus.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-300 mb-2">Attention Focus</div>
          <div className="flex flex-wrap gap-1">
            {metrics.attentionFocus.map((target, index) => (
              <span 
                key={target}
                className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded"
                style={{ opacity: 1 - (index * 0.2) }}
              >
                {target.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Personality Traits */}
      <div>
        <div className="text-xs font-medium text-gray-300 mb-2">Active Traits</div>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(metrics.personalityTraits)
            .filter(([_, value]) => Math.abs(value) > 0.3)
            .slice(0, 6)
            .map(([trait, value]) => (
              <div key={trait} className="text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 capitalize">
                    {trait.slice(0, 6)}
                  </span>
                  <span className="text-gray-300">
                    {(value * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 h-1 rounded mt-1">
                  <div 
                    className="h-1 rounded transition-all duration-300"
                    style={{ 
                      width: `${Math.abs(value) * 100}%`,
                      backgroundColor: value > 0 ? '#10b981' : '#ef4444'
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Resonance Patterns */}
      {Object.keys(metrics.resonancePatterns).length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-300 mb-2">Resonance Patterns</div>
          <div className="space-y-1">
            {Object.entries(metrics.resonancePatterns)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([pattern, value]) => (
                <div key={pattern} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 capitalize">
                    {pattern.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-700 h-1 rounded">
                      <div 
                        className="h-1 rounded bg-cyan-400 transition-all duration-300"
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-300 w-8 text-right">
                      {(value * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
});

interface MetricBarProps {
  label: string;
  value: number;
  color: string;
}

const MetricBar = ({ label, value, color }: MetricBarProps) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs text-gray-300">{(value * 100).toFixed(0)}%</span>
    </div>
    <div className="w-full bg-gray-700 h-2 rounded">
      <div 
        className="h-2 rounded transition-all duration-500"
        style={{ 
          width: `${Math.max(0, Math.min(100, value * 100))}%`,
          backgroundColor: color
        }}
      />
    </div>
  </div>
);

ReservoirMetrics.displayName = 'ReservoirMetrics';