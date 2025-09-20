import React, { useState } from 'react';
import { EdgeProps, getStraightPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
import { RelationshipData } from '@/types/nodes/nodes';
import { useDiagramStore } from '@/store/diagram.store';

// Edge personalizado para Asociación
export function AssociationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps & { data?: RelationshipData }) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempSourceCard, setTempSourceCard] = useState(data?.sourceCardinality || '');
  const [tempTargetCard, setTempTargetCard] = useState(data?.targetCardinality || '');
  const [tempLabel, setTempLabel] = useState(data?.label || '');
  const updateEdge = useDiagramStore((state) => state.updateEdge);

  const handleSave = () => {
    console.log('Saving cardinalities:', {
      sourceCardinality: tempSourceCard,
      targetCardinality: tempTargetCard,
      label: tempLabel
    });
    updateEdge(id, {
      data: {
        ...data,
        sourceCardinality: tempSourceCard,
        targetCardinality: tempTargetCard,
        label: tempLabel,
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempSourceCard(data?.sourceCardinality || '');
    setTempTargetCard(data?.targetCardinality || '');
    setTempLabel(data?.label || '');
    setIsEditing(false);
  };

  // Calculate cardinality positions along the edge
  const sourceCardX = sourceX + (targetX - sourceX) * 0.15;
  const sourceCardY = sourceY + (targetY - sourceY) * 0.15;
  const targetCardX = sourceX + (targetX - sourceX) * 0.85;
  const targetCardY = sourceY + (targetY - sourceY) * 0.85;

  // Debug log
  console.log('Edge data:', {
    id,
    sourceCardinality: data?.sourceCardinality,
    targetCardinality: data?.targetCardinality,
    label: data?.label,
    isEditing
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 2,
          stroke: '#374151',
          ...style
        }}
      />
      <EdgeLabelRenderer>
        {/* Source Cardinality */}
        {(isEditing || (data?.sourceCardinality && data.sourceCardinality.trim() !== '')) && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceCardX}px,${sourceCardY}px)`,
              pointerEvents: 'all',
            }}
          >
            {isEditing ? (
              <input
                type="text"
                value={tempSourceCard}
                onChange={(e) => setTempSourceCard(e.target.value)}
                className="w-12 h-6 text-xs text-center border border-gray-300 rounded bg-white"
                placeholder="0..*"
              />
            ) : (
              <div className="bg-white px-1 py-0.5 text-xs font-semibold text-gray-800 border border-gray-200 rounded shadow-sm">
                {data?.sourceCardinality}
              </div>
            )}
          </div>
        )}

        {/* Target Cardinality */}
        {(isEditing || (data?.targetCardinality && data.targetCardinality.trim() !== '')) && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${targetCardX}px,${targetCardY}px)`,
              pointerEvents: 'all',
            }}
          >
            {isEditing ? (
              <input
                type="text"
                value={tempTargetCard}
                onChange={(e) => setTempTargetCard(e.target.value)}
                className="w-12 h-6 text-xs text-center border border-gray-300 rounded bg-white"
                placeholder="1"
              />
            ) : (
              <div className="bg-white px-1 py-0.5 text-xs font-semibold text-gray-800 border border-gray-200 rounded shadow-sm">
                {data?.targetCardinality}
              </div>
            )}
          </div>
        )}

        {/* Center Label */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          onDoubleClick={() => setIsEditing(true)}
          className="cursor-pointer"
        >
          {isEditing ? (
            <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  className="w-24 h-6 text-xs text-center border border-gray-300 rounded"
                  placeholder="Label"
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleSave}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    ✓
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white px-2 py-1 text-xs font-medium text-gray-800 border border-gray-200 rounded shadow-sm">
              {data?.label || 'Double-click to edit'}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

// Edge personalizado para Agregación (diamante vacío)
export function AggregationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps & { data?: RelationshipData }) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(data?.label || '');
  const updateEdge = useDiagramStore((state) => state.updateEdge);

  const handleSave = () => {
    updateEdge(id, {
      data: {
        ...data,
        label: tempLabel,
      }
    });
    setIsEditing(false);
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          strokeWidth: 2,
          stroke: '#374151',
          ...style
        }}
        markerStart="url(#aggregation-start)"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          onDoubleClick={() => setIsEditing(true)}
          className="cursor-pointer"
        >
          {isEditing ? (
            <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  className="w-24 h-6 text-xs text-center border border-gray-300 rounded"
                  placeholder="Label"
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleSave}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white px-2 py-1 text-xs font-medium text-gray-800 border border-gray-200 rounded shadow-sm">
              {data?.label || 'Double-click to edit'}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
      {/* Definición del marcador de agregación */}
      <defs>
        <marker
          id="aggregation-start"
          markerWidth="24"
          markerHeight="24"
          refX="0"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0,4 8,8 16,4 8,0"
            fill="white"
            stroke="#374151"
            strokeWidth="2"
          />
        </marker>
      </defs>
    </>
  );
}

// Edge personalizado para Composición (diamante lleno)
export function CompositionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps & { data?: RelationshipData }) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(data?.label || '');
  const updateEdge = useDiagramStore((state) => state.updateEdge);

  const handleSave = () => {
    updateEdge(id, {
      data: {
        ...data,
        label: tempLabel,
      }
    });
    setIsEditing(false);
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          strokeWidth: 2,
          stroke: '#374151',
          ...style
        }}
        markerStart="url(#composition-start)"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          onDoubleClick={() => setIsEditing(true)}
          className="cursor-pointer"
        >
          {isEditing ? (
            <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  className="w-24 h-6 text-xs text-center border border-gray-300 rounded"
                  placeholder="Label"
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleSave}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white px-2 py-1 text-xs font-medium text-gray-800 border border-gray-200 rounded shadow-sm">
              {data?.label || 'Double-click to edit'}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
      {/* Definición del marcador de composición */}
      <defs>
        <marker
          id="composition-start"
          markerWidth="24"
          markerHeight="24"
          refX="0"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0,4 8,8 16,4 8,0"
            fill="#374151"
            stroke="#374151"
            strokeWidth="2"
          />
        </marker>
      </defs>
    </>
  );
}

// Edge personalizado para Herencia (flecha triangular vacía)
export function InheritanceEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps & { data?: RelationshipData }) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(data?.label || '');
  const updateEdge = useDiagramStore((state) => state.updateEdge);

  const handleSave = () => {
    updateEdge(id, {
      data: {
        ...data,
        label: tempLabel,
      }
    });
    setIsEditing(false);
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          strokeWidth: 2,
          stroke: '#374151',
          ...style
        }}
        markerEnd="url(#inheritance-end)"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          onDoubleClick={() => setIsEditing(true)}
          className="cursor-pointer"
        >
          {isEditing ? (
            <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  className="w-24 h-6 text-xs text-center border border-gray-300 rounded"
                  placeholder="Label"
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleSave}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white px-2 py-1 text-xs font-medium text-gray-800 border border-gray-200 rounded shadow-sm">
              {data?.label || 'Double-click to edit'}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
      {/* Definición del marcador de herencia */}
      <defs>
        <marker
          id="inheritance-end"
          markerWidth="24"
          markerHeight="24"
          refX="24"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="24,4 16,8 8,4 16,0"
            fill="white"
            stroke="#374151"
            strokeWidth="2"
          />
        </marker>
      </defs>
    </>
  );
}

// Edge personalizado para Dependencia (línea punteada)
export function DependencyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps & { data?: RelationshipData }) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(data?.label || '');
  const updateEdge = useDiagramStore((state) => state.updateEdge);

  const handleSave = () => {
    updateEdge(id, {
      data: {
        ...data,
        label: tempLabel,
      }
    });
    setIsEditing(false);
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 2,
          stroke: '#374151',
          strokeDasharray: '8,4',
          ...style,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          onDoubleClick={() => setIsEditing(true)}
          className="cursor-pointer"
        >
          {isEditing ? (
            <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  className="w-24 h-6 text-xs text-center border border-gray-300 rounded"
                  placeholder="Label"
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleSave}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white px-2 py-1 text-xs font-medium text-gray-800 border border-gray-200 rounded shadow-sm">
              {data?.label || 'Double-click to edit'}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

// Edge personalizado para Realización (herencia con línea punteada)
export function RealizationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps & { data?: RelationshipData }) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(data?.label || '');
  const updateEdge = useDiagramStore((state) => state.updateEdge);

  const handleSave = () => {
    updateEdge(id, {
      data: {
        ...data,
        label: tempLabel,
      }
    });
    setIsEditing(false);
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          strokeWidth: 2,
          stroke: '#374151',
          strokeDasharray: '8,4',
          ...style
        }}
        markerEnd="url(#realization-end)"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          onDoubleClick={() => setIsEditing(true)}
          className="cursor-pointer"
        >
          {isEditing ? (
            <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  className="w-24 h-6 text-xs text-center border border-gray-300 rounded"
                  placeholder="Label"
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleSave}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white px-2 py-1 text-xs font-medium text-gray-800 border border-gray-200 rounded shadow-sm">
              {data?.label || 'Double-click to edit'}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
      {/* Definición del marcador de realización */}
      <defs>
        <marker
          id="realization-end"
          markerWidth="24"
          markerHeight="24"
          refX="24"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="24,4 16,8 8,4 16,0"
            fill="white"
            stroke="#374151"
            strokeWidth="2"
          />
        </marker>
      </defs>
    </>
  );
}