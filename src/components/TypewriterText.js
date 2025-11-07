import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';

export default function TypewriterText({ text, style, delay = 80 }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(displayedText + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return <Text style={style}>{displayedText}</Text>;
}
