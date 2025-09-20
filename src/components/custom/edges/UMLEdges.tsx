import React, { useState } from 'react';
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
import { RelationshipData } from '@/types/nodes/nodes';
import { useDiagramStore } from '@/store/diagram.store';

// Utility function para calcular posiciones de cardinalidad
const getCardinalityPositions = (sourceX: number, sourceY: number, targetX: number, targetY: number, sourcePosition?: string, targetPosition?: string) => {
  let sourceCardX, sourceCardY, targetCardX, targetCardY;
  
  // Position source cardinality near source
  switch(sourcePosition) {
    case 'bottom':
      sourceCardX = sourceX;
      sourceCardY = sourceY + 20;
      break;
    case 'top':
      sourceCardX = sourceX;
      sourceCardY = sourceY - 20;
      break;
    case 'right':
      sourceCardX = sourceX + 20;
      sourceCardY = sourceY;
      break;
    case 'left':
      sourceCardX = sourceX - 20;
      sourceCardY = sourceY;
      break;
    default:
      sourceCardX = sourceX + 15;
      sourceCardY = sourceY + 15;
  }
  
  // Position target cardinality near target
  switch(targetPosition) {
    case 'bottom':
      targetCardX = targetX;
      targetCardY = targetY + 20;
      break;
    case 'top':
      targetCardX = targetX;
      targetCardY = targetY - 20;
      break;
    case 'right':
      targetCardX = targetX + 20;
      targetCardY = targetY;
      break;
    case 'left':
      targetCardX = targetX - 20;
      targetCardY = targetY;
      break;
    default:
      targetCardX = targetX - 15;
      targetCardY = targetY - 15;
  }
  
  return { sourceCardX, sourceCardY, targetCardX, targetCardY };
};

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
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSource, setIsEditingSource] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempSourceCard, setTempSourceCard] = useState(data?.sourceCardinality || '');
  const [tempTargetCard, setTempTargetCard] = useState(data?.targetCardinality || '');
  const [tempLabel, setTempLabel] = useState(data?.label || '');
  const updateEdge = useDiagramStore((state) => state.updateEdge);
  const nodes = useDiagramStore((state) => state.nodes);

  // Encontrar la clase de asociación si existe
  const associationClass = data?.associationClass ? nodes.find(node => node.id === data.associationClass) : null;

  const handleSave = () => {
    updateEdge(id, {
      data: {
        ...data,
        sourceCardinality: tempSourceCard,
        targetCardinality: tempTargetCard,
        label: tempLabel,
      }
    });
    setIsEditing(false);
    setIsEditingSource(false);
    setIsEditingTarget(false);
  };

  const handleSaveSource = () => {
    updateEdge(id, {
      data: {
        ...data,
        sourceCardinality: tempSourceCard,
      }
    });
    setIsEditingSource(false);
  };

  const handleSaveTarget = () => {
    updateEdge(id, {
      data: {
        ...data,
        targetCardinality: tempTargetCard,
      }
    });
    setIsEditingTarget(false);
  };

  const handleCancel = () => {
    setTempSourceCard(data?.sourceCardinality || '');
    setTempTargetCard(data?.targetCardinality || '');
    setTempLabel(data?.label || '');
    setIsEditing(false);
    setIsEditingSource(false);
    setIsEditingTarget(false);
  };

  // Calculate cardinality positions for step edges
  const { sourceCardX, sourceCardY, targetCardX, targetCardY } = getCardinalityPositions(
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition
  );

  // Calcular posición del centro de la línea para conectar la clase de asociación
  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;

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
      
      {/* Línea punteada hacia la clase de asociación si existe */}
      {associationClass && (
        <BaseEdge
          path={`M ${centerX} ${centerY} L ${associationClass.position.x + 50} ${associationClass.position.y + 25}`}
          style={{
            strokeWidth: 1,
            stroke: '#666',
            strokeDasharray: '4,4',
          }}
        />
      )}

      <EdgeLabelRenderer>
        {/* Source Cardinality - Always show */}
        {true && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceCardX}px,${sourceCardY}px)`,
              pointerEvents: 'all',
            }}
            onClick={() => setIsEditingSource(true)}
            className="cursor-pointer"
          >
            {isEditingSource ? (
              <input
                type="text"
                value={tempSourceCard}
                onChange={(e) => setTempSourceCard(e.target.value)}
                className="w-12 h-6 text-xs text-center border border-gray-300 rounded bg-white"
                placeholder="0..*"
                autoFocus
                onBlur={handleSaveSource}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveSource();
                  if (e.key === 'Escape') setIsEditingSource(false);
                }}
              />
            ) : (
              <div className="bg-white px-1 py-0.5 text-xs font-semibold text-gray-800 border border-gray-200 rounded shadow-sm hover:bg-gray-50">
                {data?.sourceCardinality || '•'}
              </div>
            )}
          </div>
        )}

        {/* Target Cardinality - Always show */}
        {true && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${targetCardX}px,${targetCardY}px)`,
              pointerEvents: 'all',
            }}
            onClick={() => setIsEditingTarget(true)}
            className="cursor-pointer"
          >
            {isEditingTarget ? (
              <input
                type="text"
                value={tempTargetCard}
                onChange={(e) => setTempTargetCard(e.target.value)}
                className="w-12 h-6 text-xs text-center border border-gray-300 rounded bg-white"
                placeholder="1"
                autoFocus
                onBlur={handleSaveTarget}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTarget();
                  if (e.key === 'Escape') setIsEditingTarget(false);
                }}
              />
            ) : (
              <div className="bg-white px-1 py-0.5 text-xs font-semibold text-gray-800 border border-gray-200 rounded shadow-sm hover:bg-gray-50">
                {data?.targetCardinality || '•'}
              </div>
            )}
          </div>
        )}

        {/* Center Label - Solo mostrar si hay un label real o si hay clase de asociación */}
        {(data?.label || associationClass) && (
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
              data?.label && (
                <div className="bg-white px-2 py-1 text-xs font-medium text-gray-800 border border-gray-200 rounded shadow-sm">
                  {data.label}
                </div>
              )
            )}
          </div>
        )}
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
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

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
        {/* Solo mostrar label si existe uno definido */}
        {data?.label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="cursor-pointer"
          >
            <div className="bg-white px-2 py-1 text-xs font-medium text-gray-800 border border-gray-200 rounded shadow-sm">
              {data.label}
            </div>
          </div>
        )}
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
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

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
        {/* Solo mostrar label si existe uno definido */}
        {data?.label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="cursor-pointer"
          >
            <div className="bg-white px-2 py-1 text-xs font-medium text-gray-800 border border-gray-200 rounded shadow-sm">
              {data.label}
            </div>
          </div>
        )}
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
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

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
        {/* Solo mostrar label si existe uno definido */}
        {data?.label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="cursor-pointer"
          >
            <div className="bg-white px-2 py-1 text-xs font-medium text-gray-800 border border-gray-200 rounded shadow-sm">
              {data.label}
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
      {/* Definición del marcador de herencia - triángulo vacío */}
      <defs>
        <marker
          id="inheritance-end"
          markerWidth="20"
          markerHeight="20"
          refX="20"
          refY="6"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="20,6 8,12 8,0"
            fill="white"
            stroke="#374151"
            strokeWidth="1.5"
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
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd="url(#dependency-end)"
        style={{
          strokeWidth: 2,
          stroke: '#374151',
          strokeDasharray: '8,4',
          ...style,
        }}
      />
      <EdgeLabelRenderer>
        {/* Solo mostrar label si existe uno definido */}
        {data?.label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="cursor-pointer"
          >
            <div className="bg-white px-2 py-1 text-xs font-medium text-gray-800 border border-gray-200 rounded shadow-sm">
              {data.label}
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
      {/* Definición del marcador de dependencia - flecha triangular simple */}
      <defs>
        <marker
          id="dependency-end"
          markerWidth="16"
          markerHeight="16"
          refX="16"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="16,4 8,8 8,0"
            fill="#374151"
            stroke="#374151"
            strokeWidth="1"
          />
        </marker>
      </defs>
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
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

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
        {/* Solo mostrar label si existe uno definido */}
        {data?.label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="cursor-pointer"
          >
            <div className="bg-white px-2 py-1 text-xs font-medium text-gray-800 border border-gray-200 rounded shadow-sm">
              {data.label}
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
      {/* Definición del marcador de realización - triángulo vacío con línea punteada */}
      <defs>
        <marker
          id="realization-end"
          markerWidth="20"
          markerHeight="20"
          refX="20"
          refY="6"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="20,6 8,12 8,0"
            fill="white"
            stroke="#374151"
            strokeWidth="1.5"
          />
        </marker>
      </defs>
    </>
  );
}