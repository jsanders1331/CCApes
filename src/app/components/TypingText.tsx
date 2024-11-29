import { useState, useEffect } from "react";

const TypingText = () => {
  const [text, setText] = useState("");
  const fullText = "Connect wallet to check your allowlist...";
  const [index, setIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setText(text + fullText[index]);
        setIndex(index + 1);
      }, 70); // Controls typing speed

      return () => clearTimeout(timeout);
    } else {
      setIsTypingComplete(true);
    }
  }, [index, text]);

  return (
    <>
      <style jsx>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
      <div className="font-mono text-xl mt-4 p-4">
        {text}
        {isTypingComplete && <span className="blink">|</span>}
      </div>
    </>
  );
};

export default TypingText;
