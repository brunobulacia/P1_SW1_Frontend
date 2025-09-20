import "@xyflow/react/dist/style.css";
import { useCallback, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { Attribute, ClassNodeData } from "@/types/nodes/nodes";

export function TextUpdaterNode(prop: any) {
  const nodeData = prop.data as ClassNodeData;
  const [className, setClassName] = useState(nodeData?.label || "Clase");
  const [attributes, setAttributes] = useState<Attribute[]>(nodeData?.attributes || []);
  const [showAddAttribute, setShowAddAttribute] = useState(false);
  const [newAttribute, setNewAttribute] = useState({ name: "", type: "", visibility: 'private' as const });

  const onClassNameChange = useCallback((evt: any) => {
    setClassName(evt.target.value);
  }, []);

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

  return (
    <div className="bg-white shadow-lg border-2 border-gray-800 min-w-[250px] max-w-[350px] font-mono text-sm">
      {/* Handle superior */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        style={{ background: '#374151', width: '12px', height: '12px' }}
      />
      
      {/* Nombre de la clase */}
      <div className="border-b-2 border-gray-800 p-3 bg-gray-50">
        <input 
          type="text"
          value={className}
          onChange={onClassNameChange}
          className="nodrag w-full text-center font-bold text-lg bg-transparent border-none outline-none focus:bg-white focus:border focus:border-blue-500 focus:rounded px-2 py-1"
          placeholder="NombreClase"
        />
      </div>

      {/* Sección de Atributos */}
      <div className="border-b-2 border-gray-800 min-h-[60px]">
        <div className="p-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-600">ATRIBUTOS</span>
            <button
              onClick={() => setShowAddAttribute(!showAddAttribute)}
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
                />
                <span className="mx-1">:</span>
                <input
                  type="text"
                  value={attr.type}
                  onChange={(e) => updateAttribute(attr.id, 'type', e.target.value)}
                  className="nodrag flex-1 bg-transparent border-none outline-none focus:bg-yellow-100 px-1"
                  placeholder="tipo"
                />
                <select
                  value={attr.visibility}
                  onChange={(e) => updateAttribute(attr.id, 'visibility', e.target.value)}
                  className="nodrag ml-1 text-xs bg-transparent border-none outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <option value="private">-</option>
                  <option value="public">+</option>
                  <option value="protected">#</option>
                </select>
                <button
                  onClick={() => removeAttribute(attr.id)}
                  className="ml-1 text-red-500 hover:text-red-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Formulario para agregar nuevo atributo */}
          {showAddAttribute && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
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

      {/* Sección de Métodos (placeholder por ahora) */}
      <div className="p-2 min-h-[40px]">
        <div className="text-xs font-semibold text-gray-600 mb-1">MÉTODOS</div>
        <div className="text-xs text-gray-400 italic">
          + constructor()<br/>
          + toString(): string
        </div>
      </div>

      {/* Handle inferior */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        style={{ background: '#374151', width: '12px', height: '12px' }}
      />
    </div>
  );
}