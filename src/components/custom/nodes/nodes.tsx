import "@xyflow/react/dist/style.css";
import { useCallback, useState, useEffect } from "react";
import { useReactFlow, Handle, Position } from "@xyflow/react";
import { Attribute, ClassNodeData, RelationType, Method } from "@/types/nodes/nodes";
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
  const [methods, setMethods] = useState<Method[]>(nodeData?.methods || []);
  const [showAddAttribute, setShowAddAttribute] = useState(false);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [newAttribute, setNewAttribute] = useState({ name: "", type: "", visibility: 'private' as const });
  const [newMethod, setNewMethod] = useState({ name: "", returnType: "", parameters: "", visibility: 'public' as const });
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

  // Efecto para sincronizar atributos y métodos cuando cambia el nodeData desde el store
  useEffect(() => {
    if (nodeData?.attributes) {
      setAttributes(nodeData.attributes);
    }
    if (nodeData?.methods) {
      setMethods(nodeData.methods);
    }
  }, [nodeData?.attributes, nodeData?.methods]);

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
      const newAttributes = [...attributes, attribute];
      setAttributes(newAttributes);
      
      // Sincronizar con el store global
      updateNode(prop.id, {
        data: {
          ...nodeData,
          attributes: newAttributes
        }
      });
      
      setNewAttribute({ name: "", type: "", visibility: 'private' });
      setShowAddAttribute(false);
    }
  };

  const removeAttribute = (id: string) => {
    const newAttributes = attributes.filter(attr => attr.id !== id);
    setAttributes(newAttributes);
    
    // Sincronizar con el store global
    updateNode(prop.id, {
      data: {
        ...nodeData,
        attributes: newAttributes
      }
    });
  };

  // Funciones para manejar métodos
  const addMethod = () => {
    if (newMethod.name) {
      const method: Method = {
        id: `method-${Date.now()}`,
        name: newMethod.name,
        returnType: newMethod.returnType || "void",
        parameters: newMethod.parameters,
        visibility: newMethod.visibility
      };
      const newMethods = [...methods, method];
      setMethods(newMethods);
      
      // Sincronizar con el store global
      updateNode(prop.id, {
        data: {
          ...nodeData,
          methods: newMethods
        }
      });
      
      setNewMethod({ name: "", returnType: "", parameters: "", visibility: 'public' });
      setShowAddMethod(false);
    }
  };

  const removeMethod = (id: string) => {
    const newMethods = methods.filter(method => method.id !== id);
    setMethods(newMethods);
    
    // Sincronizar con el store global
    updateNode(prop.id, {
      data: {
        ...nodeData,
        methods: newMethods
      }
    });
  };

  const updateMethod = (id: string, field: keyof Method, value: string) => {
    const newMethods = methods.map(method => 
      method.id === id ? { ...method, [field]: value } : method
    );
    setMethods(newMethods);
    
    // Sincronizar con el store global
    updateNode(prop.id, {
      data: {
        ...nodeData,
        methods: newMethods
      }
    });
  };

  const updateAttribute = (id: string, field: keyof Attribute, value: string) => {
    const newAttributes = attributes.map(attr => 
      attr.id === id ? { ...attr, [field]: value } : attr
    );
    setAttributes(newAttributes);
    
    // Sincronizar con el store global
    updateNode(prop.id, {
      data: {
        ...nodeData,
        attributes: newAttributes
      }
    });
  };

  const getVisibilitySymbol = (visibility: string) => {
    switch (visibility) {
      case 'public': return '+';
      case 'private': return '-';
      case 'protected': return '#';
      default: return '+';
    }
  };

  const formatMethod = (method: Method) => {
    const params = method.parameters ? `(${method.parameters})` : "()";
    const returnType = method.returnType ? `: ${method.returnType}` : "";
    return `${method.name}${params}${returnType}`;
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

  // Manejar click en el nodo para manejar conexiones
  const handleNodeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Si estamos en modo de conexión desde el sidebar
    if (connectionMode && !isConnecting) {
      // Primer click: seleccionar nodo origen
      startConnection(prop.id, connectionMode);
      return;
    }
    
    if (isConnecting && selectedNodeForConnection) {
      // Segundo click: crear la conexión entre origen y destino
      // Ahora permitimos relaciones recursivas (sourceId === targetId)
      const sourceId = selectedNodeForConnection;
      const targetId = prop.id;
      
      addEdge(sourceId, targetId, connectionMode!);
      return;
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
        className={`bg-white border-gray-800 shadow-lg border-2 min-w-[250px] max-w-[380px] font-mono text-sm cursor-pointer transition-all duration-200 ${
          // Nodo ya seleccionado como origen
          isConnecting && selectedNodeForConnection === prop.id 
            ? 'border-green-500 shadow-green-200 shadow-lg bg-green-50' 
            // Modo de conexión activo (cualquier nodo puede ser destino, incluyendo recursivo)
            : isConnecting && selectedNodeForConnection
              ? 'border-blue-500 shadow-blue-200 shadow-lg hover:border-blue-600 hover:bg-blue-50'
            // Modo de conexión desde sidebar (esperando selección de origen)
            : connectionMode && !isConnecting
              ? 'border-orange-500 shadow-orange-200 shadow-lg hover:border-orange-600 hover:bg-orange-50'
            // Estado normal
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
        <div className="p-2 min-h-[60px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-600">MÉTODOS</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAddMethod(!showAddMethod);
              }}
              className="text-blue-600 hover:text-blue-800 text-xs font-bold"
            >
              {showAddMethod ? '✕' : '+'}
            </button>
          </div>
          
          {/* Lista de métodos */}
          <div className="space-y-1">
            {methods.map((method) => (
              <div key={method.id} className="flex items-center group text-xs">
                <span className="w-3 text-center text-gray-600">{getVisibilitySymbol(method.visibility)}</span>
                <input
                  type="text"
                  value={method.name}
                  onChange={(e) => updateMethod(method.id, 'name', e.target.value)}
                  className="nodrag bg-transparent border-none outline-none focus:bg-yellow-100 px-1 font-medium"
                  placeholder="método"
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: `${Math.max(method.name.length * 0.6, 4)}rem` }}
                />
                <span className="text-gray-500">(</span>
                <input
                  type="text"
                  value={method.parameters || ""}
                  onChange={(e) => updateMethod(method.id, 'parameters', e.target.value)}
                  className="nodrag bg-transparent border-none outline-none focus:bg-yellow-100 px-1 text-gray-600"
                  placeholder=""
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: `${Math.max((method.parameters || "").length * 0.6, 1)}rem` }}
                />
                <span className="text-gray-500">)</span>
                {method.returnType && (
                  <>
                    <span className="text-gray-500">: </span>
                    <input
                      type="text"
                      value={method.returnType}
                      onChange={(e) => updateMethod(method.id, 'returnType', e.target.value)}
                      className="nodrag bg-transparent border-none outline-none focus:bg-yellow-100 px-1 text-blue-600"
                      placeholder="void"
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: `${Math.max(method.returnType.length * 0.6, 3)}rem` }}
                    />
                  </>
                )}
                <select
                  value={method.visibility}
                  onChange={(e) => updateMethod(method.id, 'visibility', e.target.value)}
                  className="nodrag ml-2 text-xs bg-transparent border-none outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="private">-</option>
                  <option value="public">+</option>
                  <option value="protected">#</option>
                </select>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMethod(method.id);
                  }}
                  className="ml-1 text-red-500 hover:text-red-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Formulario para agregar nuevo método */}
          {showAddMethod && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-2">
                <div className="flex items-center space-x-1">
                  <select
                    value={newMethod.visibility}
                    onChange={(e) => setNewMethod({...newMethod, visibility: e.target.value as any})}
                    className="nodrag text-xs border border-gray-300 rounded px-1 py-0.5 w-20"
                  >
                    <option value="public">+ public</option>
                    <option value="private">- private</option>
                    <option value="protected"># protected</option>
                  </select>
                  <input
                    type="text"
                    value={newMethod.name}
                    onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
                    className="nodrag flex-1 text-xs border border-gray-300 rounded px-2 py-0.5"
                    placeholder="nombreMetodo"
                  />
                </div>
                <div className="flex space-x-1">
                  <input
                    type="text"
                    value={newMethod.parameters}
                    onChange={(e) => setNewMethod({...newMethod, parameters: e.target.value})}
                    className="nodrag flex-1 text-xs border border-gray-300 rounded px-2 py-0.5"
                    placeholder="params"
                  />
                  <input
                    type="text"
                    value={newMethod.returnType}
                    onChange={(e) => setNewMethod({...newMethod, returnType: e.target.value})}
                    className="nodrag flex-1 text-xs border border-gray-300 rounded px-2 py-0.5"
                    placeholder="void"
                  />
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={addMethod}
                    className="flex-1 bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700"
                  >
                    Agregar
                  </button>
                  <button
                    onClick={() => setShowAddMethod(false)}
                    className="flex-1 bg-gray-400 text-white text-xs px-2 py-1 rounded hover:bg-gray-500"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Indicadores de estado de conexión */}
        {isConnecting && selectedNodeForConnection === prop.id && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
            Origen seleccionado
          </div>
        )}
        
        {connectionMode && !isConnecting && (
          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse">
            Click para origen
          </div>
        )}
        
        {isConnecting && selectedNodeForConnection && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse">
            {selectedNodeForConnection === prop.id ? 'Click para recursiva' : 'Click para destino'}
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