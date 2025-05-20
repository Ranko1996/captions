import './App.css';
import { useEffect, useRef } from 'react'; 

function App() {
  const videoRef = useRef(null); 

  useEffect(() => {
    async function fetchAndLogCaptions() {
      try {
        const response = await fetch('/captions/captions.vtt');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const vttText = await response.text();

        console.log('Sadržaj VTT datoteke:', vttText);

      } catch (error) {
        console.error('Greška pri dohvaćanju titlova:', error);
      }
    }

    fetchAndLogCaptions(); 
  }, []); 

  return (
    <>
      <video controls ref={videoRef}>
        <source src="/videos/clip.mp4" type="video/mp4" />
        <track
          kind="captions"
          srcLang="en"
          src="/captions/captions.vtt"
        />
      </video>
      <div>
        Prikazi captions ovdje
      </div>
    </>
  );
}

export default App;