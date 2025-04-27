import { Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useEffect, useState } from "react";

const float = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(10px, -10px) rotate(2deg); }
  50% { transform: translate(0, -20px) rotate(0deg); }
  75% { transform: translate(-10px, -10px) rotate(-2deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
`;

interface Bubble {
  id: number;
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
}

export const AnimatedBackground = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const generateBubbles = () => {
      const newBubbles: Bubble[] = [];
      for (let i = 0; i < 15; i++) {
        newBubbles.push({
          id: i,
          size: Math.random() * 300 + 100, // Size between 100-400px
          left: Math.random() * 100, // Position between 0-100%
          top: Math.random() * 100,
          duration: Math.random() * 10 + 15, // Animation duration between 15-25s
          delay: Math.random() * -20, // Random start time
        });
      }
      setBubbles(newBubbles);
    };

    generateBubbles();
  }, []);

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      overflow="hidden"
      pointerEvents="none"
      zIndex={1}
    >
      {bubbles.map((bubble) => (
        <Box
          key={bubble.id}
          position="absolute"
          left={`${bubble.left}%`}
          top={`${bubble.top}%`}
          width={`${bubble.size}px`}
          height={`${bubble.size}px`}
          borderRadius="full"
          background="radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0))"
          animation={`${float} ${bubble.duration}s infinite ease-in-out`}
          style={{ animationDelay: `${bubble.delay}s` }}
          opacity={0.6}
        />
      ))}
    </Box>
  );
};
