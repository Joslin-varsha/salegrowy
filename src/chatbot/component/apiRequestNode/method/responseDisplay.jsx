import React from "react";

function ResponseDisplay({ flattened }) {
  if (!flattened) return null;

  //const flattened = flattenObject(response);

  return (
    <div className="flex-col mt-4 space-y-2">
        {flattened.map((row, index) => (
            <div key={index} className="flex w-full space-x-2">
            {/* Left column: key */}
            <div className="w-1/2 p-2 border border-blue-300 rounded bg-gray-200 font-medium text-black break-words">
                <strong>{row.key}</strong>
            </div>

            {/* Right column: value */}
            <div className="w-1/2 p-2 border border-blue-300 rounded bg-gray-200 font-medium text-black break-words">
                {row.value?.toString() || ""}
            </div>
            </div>
        ))}
    </div>
  );
}

export default ResponseDisplay;
