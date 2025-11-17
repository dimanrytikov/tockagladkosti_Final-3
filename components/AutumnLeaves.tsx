import React, { useMemo } from 'react';

const ELEMENTS = ['🍁', '🍂', '❄️', '❅', '🍂', '🍁']; // Mix of leaves and snowflakes for seasonal variety
const ELEMENT_COUNT = 40; // Increased count for a fuller, more immersive effect

// Helper function to distinguish between element types for different animations
const isLeaf = (char: string) => ['🍁', '🍂'].includes(char);

const AutumnLeaves: React.FC = () => {
    const elements = useMemo(() => {
        return Array.from({ length: ELEMENT_COUNT }).map((_, i) => {
            const type = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
            const isLeafType = isLeaf(type);

            return {
                id: i,
                type: type,
                // The main vertical 'fall' animation style
                fallStyle: {
                    left: `${Math.random() * 100}vw`,
                    // Snowflakes fall a bit slower on average for a more gentle effect
                    animationDuration: `${Math.random() * (isLeafType ? 8 : 12) + (isLeafType ? 7 : 10)}s`, 
                    animationDelay: `${Math.random() * 15}s`,
                },
                // The horizontal movement animation style (sway for leaves, flutter for snowflakes)
                horizontalAnimationStyle: {
                    // Snowflakes drift more slowly and gracefully than leaves tumble
                    animationDuration: `${Math.random() * 4 + (isLeafType ? 3 : 6)}s`,
                },
                // Styles for the emoji character itself
                elementStyle: {
                    // Snowflakes are slightly smaller and more varied in size
                    fontSize: `${Math.random() * (isLeafType ? 0.8 : 0.6) + (isLeafType ? 0.9 : 0.7)}rem`,
                    opacity: Math.random() * 0.6 + 0.4,
                },
                // The Tailwind CSS class that determines which animation to use
                animationClass: isLeafType ? 'animate-sway' : 'animate-flutter',
            };
        });
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1]" aria-hidden="true">
            {elements.map(el => (
                <div
                    key={el.id}
                    className="absolute top-[-10vh] animate-fall"
                    style={el.fallStyle}
                >
                    <div className={el.animationClass} style={el.horizontalAnimationStyle}>
                         <span style={el.elementStyle}>{el.type}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default React.memo(AutumnLeaves);
