import './App.css';
import { useRef } from 'react'; 
import { formatTime } from './utils/timeFormater'; 

// Import custom hookova
import { useCaptions } from './hooks/useCaptions';
import { useCaptionSynchronization } from './hooks/useCaptionSincronization';

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const captionsContainerRef = useRef<HTMLDivElement>(null);

  const { parsedCaptions, videoSource, captionsSource, changeMedia } = useCaptions();

  const { activeIndex, handleTimeUpdate, handleCaptionClick } = useCaptionSynchronization({
    videoRef,
    captionsContainerRef,
    parsedCaptions,
  });


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