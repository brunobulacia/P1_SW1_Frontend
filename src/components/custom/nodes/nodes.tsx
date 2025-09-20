import "@xyflow/react/dist/style.css";
import { useCallback } from "react";

export function TextUpdaterNode(prop: any) {
  const onChange = useCallback((evt: any) => {
    console.log(evt.target.value);
  }, []);
 
  return (
    <div className="bg-white  shadow-lg border-2 border-gray-300 min-w-[180px] hover:shadow-xl transition-shadow">
      <div className="p-4">
        <div className="mb-2">
          <label htmlFor="text" className="block text-sm font-semibold text-gray-700 mb-1">
          </label>
          <input 
            id="text" 
            name="text" 
            onChange={onChange} 
            className="nodrag block w-full text-sm border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            defaultValue={""}
          />
        </div>
      </div>
     
    </div>
  );
}