import React from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { Trash2, Clock3, ChevronDown } from "lucide-react";

function TimeNode({ data, selected, id }) {
  const { deleteElements } = useReactFlow();

  return (
    <div
      className={`group w-32 h-32 rounded-full shadow-md text-center relative flex flex-col justify-between items-center p-3
    ${selected ? "ring-2 ring-white scale-105" : ""} hover:shadow-2xl
    bg-[#3e56e0] text-white transition-all duration-300`}
    >
      <button
        onClick={() => deleteElements({ nodes: [{ id }] })}
        className="absolute top-2 right-2 text-red-600 hover:text-red-300 transition opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={16} />
      </button>

      {/* Label */}
      <div className="items-center ">
        {/* Icon */}
        <Clock3 size={32} className="mx-auto mt-3" />
        {/* <p className="text-sm font-semibold mt-2">Wait</p> */}
        <p className="text-xs opacity-90 pt-2">
        {data?.waitTime || "2 "} {data?.waitUnit || "Hrs"}
      </p>
      <small className="font-bold">Delay</small>
      </div>
      

      {/* Handles */}
      <Handle
        id="a"
        type="target"
        position={Position.Left}
        className="w-1 rounded-full bg-slate-500"
      />
      <Handle
        id="b"
        type="source"
        position={Position.Right}
        className="custom-handle p-2"
      >
        <span className="handle-icon"> +</span>
      </Handle>
    </div>
  );
}

export default TimeNode;
