import { useState, useEffect } from "react";

const TypingText = () => {
  const [text, setText] = useState("");
  const fullText = "Connect wallet to check your allowlist...";
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setText(text + fullText[index]);
        setIndex(index + 1);
      }, 70); // Controls typing speed

      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return (
    <div className="font-mono text-lg p-4">
      {text}
      <span className="animate-pulse">|</span>
    </div>
  );
};

export default TypingText;
