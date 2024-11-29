import React, { useEffect, useState } from "react";
import Image from "next/image";

const LoadingSquares = () => {
  const [activeSquares, setActiveSquares] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSquares((prev) => (prev + 1) % 9);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <Image
          src="/box_logo_small.png"
          alt="Loading"
          width={128}
          height={128}
        />
      </div>
      <div className="border-2 border-black p-1 my-8">
        <div className="flex justify-center items-center space-x-1">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className={`w-4 h-4 transition-colors duration-200 ${
                index <= activeSquares ? "bg-black" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSquares;
