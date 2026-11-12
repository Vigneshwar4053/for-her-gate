import {remaining} from './exam-engine.js';
export function startTimer(session,onTick,onExpire) {
  let interval,finished=false;
  const tick=()=>{if(finished)return;const ms=remaining(session);onTick(ms);if(ms!==null&&ms<=0){finished=true;clearInterval(interval);onExpire();}};
  interval=setInterval(tick,1000); tick();
  return ()=>{finished=true;clearInterval(interval);};
}
export function formatTime(ms){if(ms===null)return 'Learning mode';const s=Math.ceil(ms/1000);return `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor(s%3600/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;}
