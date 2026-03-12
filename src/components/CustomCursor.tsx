import { useEffect, useState } from "react";

const CustomCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-[9999] rounded-full mix-blend-difference"
      style={{
        width: 60,
        height: 60,
        backgroundColor: "black",
        left: pos.x - 30,
        top: pos.y - 30,
        transition: "left 0.15s ease-out, top 0.15s ease-out",
      }}
    />
  );
};

export default CustomCursor;
