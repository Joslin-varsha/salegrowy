import { getSmoothStepPath, useReactFlow } from "reactflow";
import { X } from "lucide-react";


const CustomStepEdge = ({ id, sourceX, sourceY, targetX, targetY }) => {
  const { deleteElements } = useReactFlow();

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 20,
  });

  // Calculate the approximate midpoint of the edge
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Function to handle edge deletion
  const handleRemoveEdge = () => {
    deleteElements({ edges: [{ id }] });
  };

  return (
    <>
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#31c5f0" />
        </marker>
      </defs>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        stroke="#31c5f0"
        strokeWidth={4}
        fill="none"
        strokeOpacity="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd="url(#arrow)"
        pointerEvents="none"
      />
      {/* Remove Icon at Edge Center */}
      <foreignObject
        x={midX - 12}
        y={midY - 12}
        width={24}
        height={24}
        className="cursor-pointer"
        onClick={handleRemoveEdge}
      >
        <div className="flex items-center justify-center w-full h-full bg-red-500 rounded-full hover:bg-red-600 transition-colors">
          <X size={16} color="white" />
        </div>
      </foreignObject>
    </>
  );
};

export default CustomStepEdge;
