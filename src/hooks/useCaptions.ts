import { useEffect, useState } from 'react';
import { parseVTT } from '../utils/captionParser'; // Putanja do captionParser.ts
import type { Caption } from '../types/caption'; // Putanja do caption.ts

interface UseCaptionsReturn {
  parsedCaptions: Caption[];
  videoSource: string;
  captionsSource: string; // Dodajemo i captionsSource ako ti treba za track tag
  changeMedia: (videoPath: string, captionsPath: string) => void;
}

export const useCaptions = (): UseCaptionsReturn => {
  const [parsedCaptions, setParsedCaptions] = useState<Caption[]>([]);
  const [videoSource, setVideoSource] = useState<string>('/videos/clip.mp4');
  const [captionsSource, setCaptionsSource] = useState<string>('/captions/captions.vtt');

  useEffect(() => {
    async function fetchAndParseCaptions() {
      try {
        setParsedCaptions([]);

        const response = await fetch(captionsSource);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const vttText = await response.text();
        console.log(`Sadržaj VTT datoteke (${captionsSource}):`, vttText);

        const captionsArray = parseVTT(vttText);
        setParsedCaptions(captionsArray);
        console.log('Parsirani titlovi (JS objekt):', captionsArray);

      } catch (error) {
        console.error('Greška pri dohvaćanju ili parsiranju titlova:', error);
      }
    }

    fetchAndParseCaptions();
  }, [captionsSource]); 

  const changeMedia = (videoPath: string, captionsPath: string) => {
    setVideoSource(videoPath);
    setCaptionsSource(captionsPath);
   
  };

  return { parsedCaptions, videoSource, captionsSource, changeMedia };
};