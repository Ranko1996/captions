import { useState, useEffect, type RefObject } from 'react';
import type { Caption } from '../types/caption'; 

interface UseCaptionSynchronizationProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  captionsContainerRef: RefObject<HTMLDivElement | null>; 
  parsedCaptions: Caption[];
}

interface UseCaptionSynchronizationReturn {
  activeIndex: number | null;
  handleTimeUpdate: () => void;
  handleCaptionClick: (startTime: number) => void;
}

export const useCaptionSynchronization = ({
  videoRef,
  captionsContainerRef,
  parsedCaptions,
}: UseCaptionSynchronizationProps): UseCaptionSynchronizationReturn => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleTimeUpdate = () => {
    if (videoRef.current && parsedCaptions.length > 0) {
      const currentTime = videoRef.current.currentTime;
      const newActiveIndex = parsedCaptions.findIndex(
        (caption) => currentTime >= caption.startTime && currentTime < caption.endTime
      );

      if (newActiveIndex === -1) {
        if (activeIndex !== null) {
          setActiveIndex(null);
        }
      } else if (newActiveIndex !== activeIndex) {
        setActiveIndex(newActiveIndex);
      }
    }
  };

  useEffect(() => {
    if (activeIndex !== null && captionsContainerRef.current) {
      const activeElement = captionsContainerRef.current.children[activeIndex + 1] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth', 
          block: 'center',
        });
      }
    }
  }, [activeIndex, captionsContainerRef]);

  const handleCaptionClick = (startTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
    }
  };

  return { activeIndex, handleTimeUpdate, handleCaptionClick };
};