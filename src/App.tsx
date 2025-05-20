import './App.css';
import { useEffect, useRef, useState } from 'react';
// import { parseVTT } from './utils/captionParser';
// import type { Caption } from './types/caption';
import { formatTime } from './utils/timeFormater';
import { useCaptions } from './hooks/useCaptions';



function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const captionsContainerRef = useRef<HTMLDivElement>(null);
 
  const { parsedCaptions, videoSource, captionsSource, changeMedia } = useCaptions();

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
        const activeElement = captionsContainerRef.current.children[activeIndex + 1];
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
        

        <div className="captions-card scrollable-captions" ref={captionsContainerRef}>
          <h3>Caption:</h3>
          {parsedCaptions.length > 0 ? (
            parsedCaptions.map((caption, index) => (
              <p
                key={index}
                className={`all-caption-item ${index === activeIndex ? 'active-caption' : ''}`}
                onClick={() => handleCaptionClick(caption.startTime)}
              >
                <span className="timestamp">{formatTime(caption.startTime)}</span> {caption.text}
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



export default App;