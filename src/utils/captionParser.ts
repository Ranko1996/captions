import type { Caption } from "../types/caption";


  export function parseVTT(vttText: string): Caption[] {
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