import './App.css';
import { useEffect, useRef, useState } from 'react';

interface Caption {
  startTime: number;
  endTime: number;
  text: string;
}

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Refenca na scrollable div je sad opet na .captions-card
  const captionsContainerRef = useRef<HTMLDivElement>(null);
  const [parsedCaptions, setParsedCaptions] = useState<Caption[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [videoSource, setVideoSource] = useState<string>('/videos/clip.mp4');
  const [captionsSource, setCaptionsSource] = useState<string>('/captions/captions.vtt');

  useEffect(() => {
    async function fetchAndParseCaptions() {
      try {
        setParsedCaptions([]);
        setActiveIndex(null);

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

  const handleTimeUpdate = () => {
    if (videoRef.current && parsedCaptions.length > 0) {
      const currentTime = videoRef.current.currentTime;
      const newActiveIndex = parsedCaptions.findIndex(
        (caption) => currentTime >= caption.startTime && currentTime <= caption.endTime
      );

      if (newActiveIndex !== activeIndex) {
        setActiveIndex(newActiveIndex);
      }
    }
  };

  useEffect(() => {
    if (activeIndex !== null && captionsContainerRef.current) {
      // Ovdje se vraćamo na old-school pristup, children[activeIndex]
      // jer je captionsContainerRef sada opet direktno na .captions-card
      const activeElement = captionsContainerRef.current.children[activeIndex + 1]; // +1 zbog h3 naslova
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [activeIndex]);

  const handleCaptionClick = (startTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
    }
  };

  const changeMedia = (videoPath: string, captionsPath: string) => {
    setVideoSource(videoPath);
    setCaptionsSource(captionsPath);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play();
    }
  };

  // --- Funkcije za parsiranje (ostaju iste) ---
  function parseVTT(vttText: string): Caption[] {
    const lines = vttText.split('\n').filter(line => line.trim() !== '');
    const captions: Caption[] = [];
    let i = 0;

    if (lines[0] === 'WEBVTT') {
      i = 1;
    }

    while (i < lines.length) {
      let currentCaption: Partial<Caption> = {};

      if (lines[i].trim() === '' || lines[i].startsWith('NOTE')) {
        i++;
        continue;
      }

      if (lines[i].includes('-->')) {
        const timecodeLine = lines[i];
        const [startTimeString, endTimeString] = timecodeLine.split('-->').map(s => s.trim());
        currentCaption.startTime = parseTime(startTimeString);
        currentCaption.endTime = parseTime(endTimeString);
        i++;
      } else {
        i++;
        continue;
      }

      let textLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('-->')) {
        textLines.push(lines[i]);
        i++;
      }
      currentCaption.text = textLines.join('\n');

      if (currentCaption.startTime !== undefined && currentCaption.endTime !== undefined && currentCaption.text !== undefined) {
          captions.push(currentCaption as Caption);
      } else {
          console.warn('Nepotpun titl preskočen:', currentCaption);
      }
    }
    return captions;
  }

  function parseTime(timeString: string): number {
    const parts = timeString.split(':');
    let seconds = 0;

    if (parts.length === 3) {
      const [hours, minutes, secondsAndMs] = parts;
      const [sec, ms = '0'] = secondsAndMs.split('.');
      seconds = parseInt(hours, 10) * 3600 +
                parseInt(minutes, 10) * 60 +
                parseInt(sec, 10) +
                parseInt(ms, 10) / 1000;
    } else if (parts.length === 2) {
      const [minutes, secondsAndMs] = parts;
      const [sec, ms = '0'] = secondsAndMs.split('.');
      seconds = parseInt(minutes, 10) * 60 +
                parseInt(sec, 10) +
                parseInt(ms, 10) / 1000;
    } else {
      const [sec, ms = '0'] = timeString.split('.');
      seconds = parseInt(sec, 10) + parseInt(ms, 10) / 1000;
    }
    return seconds;
  }
  // --- Kraj funkcija za parsiranje ---

  return (
    <>
     <div className="media-switcher">
        <button onClick={() => changeMedia('/videos/clip.mp4', '/captions/captions.vtt')}>
          Video 1
        </button>
        <button onClick={() => changeMedia('/videos/clip1.mp4', '/captions/captions1.vtt')}>
          Video 2
        </button>
      </div>
      <div className="video-and-captions-container">
        <video controls ref={videoRef} onTimeUpdate={handleTimeUpdate} key={videoSource}>
          <source src={videoSource} type="video/mp4" />
          <track kind="captions" srcLang="en" src={captionsSource} />
        </video>

        {/* Captions Card (transkript ostaje desno) */}
        <div className="captions-card scrollable-captions" ref={captionsContainerRef}>
          <h3>Caption:</h3>
          {/* Nema više 'caption-list-content' div-a, titlovi su direktni potomci .captions-card */}
          {parsedCaptions.length > 0 ? (
            parsedCaptions.map((caption, index) => (
              <p
                key={index}
                className={`all-caption-item ${index === activeIndex ? 'active-caption' : ''}`}
                onClick={() => handleCaptionClick(caption.startTime)}
              >
                <span className="timestamp">[{formatTime(caption.startTime)}]</span> {caption.text}
              </p>
            ))
          ) : (
            <p>Učitavanje titlova...</p>
          )}
        </div>
      </div>

      
     
    </>
  );
}

function formatTime(seconds: number): string {
  const date = new Date(0);
  date.setSeconds(seconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedMinutes}:${formattedSeconds}`;
  }
}

export default App;