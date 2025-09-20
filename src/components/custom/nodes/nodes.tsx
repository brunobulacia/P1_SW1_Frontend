import "@xyflow/react/dist/style.css";
import { useCallback, useState, useEffect } from "react";
import { useReactFlow, Handle, Position } from "@xyflow/react";
import { Attribute, ClassNodeData, RelationType } from "@/types/nodes/nodes";
import { useDiagramStore } from "@/store/diagram.store";
import {
  UmlAssociationIcon,
  UmlAggregationIcon,
  UmlCompositionIcon,
  UmlGeneralizationIcon,
  UmlDependencyIcon,
  UmlRealizationIcon,
} from "@/components/custom/icons/UMLIcons";

export function TextUpdaterNode(prop: any) {
  const nodeData = prop.data as ClassNodeData;
  const [className, setClassName] = useState(nodeData?.label || "Clase");
  const [attributes, setAttributes] = useState<Attribute[]>(nodeData?.attributes || []);
  const [showAddAttribute, setShowAddAttribute] = useState(false);
  const [newAttribute, setNewAttribute] = useState({ name: "", type: "", visibility: 'private' as const });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });
  
  // Store and ReactFlow hooks
  const { 
    addEdge, 
    connectionMode, 
    isConnecting, 
    selectedNodeForConnection,
    startConnection,
    resetConnection,
    updateNode 
  } = useDiagramStore();
  const { getNodes } = useReactFlow();

  // Efecto para cerrar el menú contextual al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu.show) {
        closeContextMenu();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (contextMenu.show) {
          closeContextMenu();
        }
        if (isConnecting) {
          resetConnection();
        }
      }
    };

    if (contextMenu.show) {
      document.addEventListener('click', handleClickOutside);
    }
    
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [contextMenu.show, isConnecting, resetConnection]);

  const onClassNameChange = useCallback((evt: any) => {
    const newName = evt.target.value;
    setClassName(newName);
    // Actualizar el store para persistir el cambio
    updateNode(prop.id, {
      data: {
        ...nodeData,
        label: newName
      }
    });
  }, [updateNode, prop.id, nodeData]);

  const addAttribute = () => {
    if (newAttribute.name && newAttribute.type) {
      const attribute: Attribute = {
        id: `attr-${Date.now()}`,
        name: newAttribute.name,
        type: newAttribute.type,
        visibility: newAttribute.visibility
      };
      setAttributes([...attributes, attribute]);
      setNewAttribute({ name: "", type: "", visibility: 'private' });
      setShowAddAttribute(false);
    }
  };

  const removeAttribute = (id: string) => {
    setAttributes(attributes.filter(attr => attr.id !== id));
  };

  const updateAttribute = (id: string, field: keyof Attribute, value: string) => {
    setAttributes(attributes.map(attr => 
      attr.id === id ? { ...attr, [field]: value } : attr
    ));
  };

  const getVisibilitySymbol = (visibility: string) => {
    switch (visibility) {
      case 'public': return '+';
      case 'private': return '-';
      case 'protected': return '#';
      default: return '-';
    }
  };

  // Manejo del menú contextual - versión simplificada
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Obtener las coordenadas del nodo
    const nodeElement = event.currentTarget as HTMLElement;
    const rect = nodeElement.getBoundingClientRect();
    
    // Posicionar el menú en la esquina superior derecha del nodo
    const x = rect.right + 5; // 5px a la derecha del nodo
    const y = rect.top; // Alineado con la parte superior del nodo
    
    // Verificar si se sale de la pantalla y ajustar
    const windowWidth = window.innerWidth;
    const menuWidth = 500;
    
    let finalX = x;
    if (x + menuWidth > windowWidth) {
      // Si se sale por la derecha, ponerlo a la izquierda del nodo
      finalX = rect.left - menuWidth - 5;
    }
    
    setContextMenu({
      x: finalX,
      y: y,
      show: true
    });
  };

  // Cerrar menú contextual
  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, show: false });
  };

  // Iniciar conexión con un tipo de relación específico
  const handleStartConnection = (relationType: RelationType) => {
    startConnection(prop.id, relationType);
    closeContextMenu();
  };

  // Manejar click en el nodo para completar conexión
  const handleNodeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (isConnecting && selectedNodeForConnection && selectedNodeForConnection !== prop.id) {
      // Crear la conexión
      const sourceId = selectedNodeForConnection;
      const targetId = prop.id;
      
      addEdge(sourceId, targetId, connectionMode!);
    }
  };

  const relationshipIcons = {
    association: <UmlAssociationIcon className="w-4 h-4" />,
    aggregation: <UmlAggregationIcon className="w-4 h-4" />,
    composition: <UmlCompositionIcon className="w-4 h-4" />,
    generalization: <UmlGeneralizationIcon className="w-4 h-4" />,
    dependency: <UmlDependencyIcon className="w-4 h-4" />,
    realization: <UmlRealizationIcon className="w-4 h-4" />,
  };

  return (
    <>
      <div 
        className={`bg-white border-gray-800 shadow-lg border-2 min-w-[250px] max-w-[350px] font-mono text-sm cursor-pointer transition-all duration-200 ${
          isConnecting && selectedNodeForConnection !== prop.id 
            ? 'border-blue-500 shadow-blue-200 shadow-lg hover:border-blue-600' 
            : isConnecting 
              ? 'border-green-500 shadow-green-200' 
              : 'border-gray-800 hover:border-gray-600'
        }`}
        onContextMenu={handleContextMenu}
        onClick={handleNodeClick}
      >
        {/* Nombre de la clase */}
        <div className="border-b-2 p-3 border-gray-800 bg-gray-50">
          <input 
            type="text"
            value={className}
            onChange={onClassNameChange}
            className="nodrag w-full text-center font-bold text-lg bg-transparent border-none outline-none focus:bg-white focus:border focus:border-blue-500 focus:rounded px-2 py-1"
            placeholder="NombreClase"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Sección de Atributos */}
        <div className="border-b-2 min-h-[60px] border-gray-800">
          <div className="p-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-600">ATRIBUTOS</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddAttribute(!showAddAttribute);
                }}
                className="text-blue-600 hover:text-blue-800 text-xs font-bold"
              >
                {showAddAttribute ? '✕' : '+'}
              </button>
            </div>
            
            {/* Lista de atributos */}
            <div className="space-y-1">
              {attributes.map((attr) => (
                <div key={attr.id} className="flex items-center group">
                  <span className="w-4 text-center">{getVisibilitySymbol(attr.visibility)}</span>
                  <input
                    type="text"
                    value={attr.name}
                    onChange={(e) => updateAttribute(attr.id, 'name', e.target.value)}
                    className="nodrag flex-1 bg-transparent border-none outline-none focus:bg-yellow-100 px-1"
                    placeholder="nombre"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="mx-1">:</span>
                  <input
                    type="text"
                    value={attr.type}
                    onChange={(e) => updateAttribute(attr.id, 'type', e.target.value)}
                    className="nodrag flex-1 bg-transparent border-none outline-none focus:bg-yellow-100 px-1"
                    placeholder="tipo"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <select
                    value={attr.visibility}
                    onChange={(e) => updateAttribute(attr.id, 'visibility', e.target.value)}
                    className="nodrag ml-1 text-xs bg-transparent border-none outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="private">-</option>
                    <option value="public">+</option>
                    <option value="protected">#</option>
                  </select>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAttribute(attr.id);
                    }}
                    className="ml-1 text-red-500 hover:text-red-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Formulario para agregar nuevo atributo */}
            {showAddAttribute && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center space-x-1 mb-2">
                  <select
                    value={newAttribute.visibility}
                    onChange={(e) => setNewAttribute({...newAttribute, visibility: e.target.value as any})}
                    className="nodrag text-xs border border-gray-300 rounded px-1"
                  >
                    <option value="private">- private</option>
                    <option value="public">+ public</option>
                    <option value="protected"># protected</option>
                  </select>
                </div>
                <div className="flex space-x-1 mb-2">
                  <input
                    type="text"
                    value={newAttribute.name}
                    onChange={(e) => setNewAttribute({...newAttribute, name: e.target.value})}
                    className="nodrag flex-1 text-xs border border-gray-300 rounded px-2 py-1"
                    placeholder="nombre"
                  />
                  <input
                    type="text"
                    value={newAttribute.type}
                    onChange={(e) => setNewAttribute({...newAttribute, type: e.target.value})}
                    className="nodrag flex-1 text-xs border border-gray-300 rounded px-2 py-1"
                    placeholder="tipo"
                  />
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={addAttribute}
                    className="flex-1 bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Agregar
                  </button>
                  <button
                    onClick={() => setShowAddAttribute(false)}
                    className="flex-1 bg-gray-400 text-white text-xs px-2 py-1 rounded hover:bg-gray-500"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Métodos */}
        <div className="p-2 min-h-[40px]">
          <div className="text-xs font-semibold text-gray-600 mb-1">MÉTODOS</div>
          <div className="text-xs text-gray-400 italic">
            + constructor()<br/>
            + toString(): string
          </div>
        </div>

        {/* Indicador de estado de conexión */}
        {isConnecting && selectedNodeForConnection === prop.id && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
            Selecciona el nodo destino
          </div>
        )}

        {/* Handles invisibles para ReactFlow - múltiples puntos de conexión */}
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{ opacity: 0, pointerEvents: 'none', left: '50%' }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          style={{ opacity: 0, pointerEvents: 'none', left: '50%' }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          style={{ opacity: 0, pointerEvents: 'none', top: '50%' }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          style={{ opacity: 0, pointerEvents: 'none', top: '50%' }}
        />
        
        {/* Handles adicionales para evitar solapamiento */}
        <Handle
          type="target"
          position={Position.Top}
          id="top-left"
          style={{ opacity: 0, pointerEvents: 'none', left: '25%' }}
        />
        <Handle
          type="target"
          position={Position.Top}
          id="top-right"
          style={{ opacity: 0, pointerEvents: 'none', left: '75%' }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom-left"
          style={{ opacity: 0, pointerEvents: 'none', left: '25%' }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom-right"
          style={{ opacity: 0, pointerEvents: 'none', left: '75%' }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left-top"
          style={{ opacity: 0, pointerEvents: 'none', top: '25%' }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="left-bottom"
          style={{ opacity: 0, pointerEvents: 'none', top: '75%' }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right-top"
          style={{ opacity: 0, pointerEvents: 'none', top: '25%' }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right-bottom"
          style={{ opacity: 0, pointerEvents: 'none', top: '75%' }}
        />
      </div>

      {/* Menú contextual */}
      {contextMenu.show && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-md shadow-xl py-1 min-w-[200px] z-[9999]"
          style={{ 
            left: 350, 
            top: 0,
            zIndex: 9999,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-100">
            Crear Relación
          </div>
          
          <div className="py-1">
            <button
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center transition-colors duration-150"
              onClick={() => handleStartConnection('association')}
            >
              <UmlAssociationIcon className="mr-2 h-4 w-4" />
              <span>Asociación</span>
            </button>
            <button
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center transition-colors duration-150"
              onClick={() => handleStartConnection('many-to-many')}
            >
              <UmlAssociationIcon className="mr-2 h-4 w-4" />
              <span>Muchos-a-Muchos</span>
            </button>
            <button
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center transition-colors duration-150"
              onClick={() => handleStartConnection('aggregation')}
            >
              <UmlAggregationIcon className="mr-2 h-4 w-4" />
              <span>Agregación</span>
            </button>
            <button
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center transition-colors duration-150"
              onClick={() => handleStartConnection('composition')}
            >
              <UmlCompositionIcon className="mr-2 h-4 w-4" />
              <span>Composición</span>
            </button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center transition-colors duration-150"
              onClick={() => handleStartConnection('inheritance')}
            >
              <UmlGeneralizationIcon className="mr-2 h-4 w-4" />
              <span>Herencia</span>
            </button>
            <button
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center transition-colors duration-150"
              onClick={() => handleStartConnection('realization')}
            >
              <UmlRealizationIcon className="mr-2 h-4 w-4" />
              <span>Realización</span>
            </button>
            <button
              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 flex items-center transition-colors duration-150"
              onClick={() => handleStartConnection('dependency')}
            >
              <UmlDependencyIcon className="mr-2 h-4 w-4" />
              <span>Dependencia</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}