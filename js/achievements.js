import {addStudyDay,localDay} from './analytics.js';
export function achievements(attempts,definitions) {
  const unlocked=new Map(),seen=new Map(),studyDays=new Set();let bestStreak=0;
  for(const a of [...attempts].filter(a=>a.valid).sort((a,b)=>a.submittedAt-b.submittedAt)){
    if(a.result.correct+a.result.incorrect>0)bestStreak=Math.max(bestStreak,addStudyDay(studyDays,a.day||localDay(a.submittedAt)));if(a.kind!=='revision')seen.set(a.testId,a);
    for(const d of definitions){if(unlocked.has(d.id))continue;const c=d.condition;
      const count=c.kind==='tests'?seen.size:c.kind==='streak'?bestStreak:c.kind==='pyq'?[...seen.values()].filter(a=>a.category==='pyq').length:[...seen.values()].filter(a=>a.subject===c.subject).length;
      if(count>=c.value)unlocked.set(d.id,a.submittedAt);
    }
  }
  return definitions.map(d=>({...d,unlocked:unlocked.has(d.id),unlockedAt:unlocked.get(d.id)||null}));
}
