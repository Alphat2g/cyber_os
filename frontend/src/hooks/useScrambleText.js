import { useState, useEffect } from 'react';

const CHARACTERS = '!@#$%^&*()_+-=[]{}|;:,.<>/?1234567890abcdef';

export const useScrambleText = (targetText, speed = 30) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        let iteration = 0;
        let interval = null;

        // Initial scramble
        interval = setInterval(() => {
            setDisplayText(prev => {
                return targetText
                    .split('')
                    .map((char, index) => {
                        if (index < iteration) {
                            return targetText[index];
                        }
                        return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
                    })
                    .join('');
            });

            if (iteration >= targetText.length) {
                clearInterval(interval);
            }

            iteration += 1 / 3; // Control text resolve speed
        }, speed);

        return () => clearInterval(interval);
    }, [targetText, speed]);

    return displayText;
};
