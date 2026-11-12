import {addStudyDay,localDay} from './analytics.js';
export function deriveRewards(attempts,config,messages={milestones:{}}) {
  const ledger=new Map(),completed=new Set(),correct=new Set(),milestones=[],studyDays=new Set();let bestStreak=0,sourceAttemptId=null;
  const grant=(id,hearts,at,label)=>{if(!ledger.has(id))ledger.set(id,{id,hearts,at,label,attemptId:sourceAttemptId});};
  for(const a of [...attempts].filter(a=>a.valid).sort((a,b)=>a.submittedAt-b.submittedAt||a.id.localeCompare(b.id))){
    sourceAttemptId=a.id;
    if(a.result.correct+a.result.incorrect>0)bestStreak=Math.max(bestStreak,addStudyDay(studyDays,a.day||localDay(a.submittedAt)));
    if(bestStreak>=7)grant('streak:7',config.streak7,a.submittedAt,'First 7-day streak');
    for(const r of a.result.rows)if(r.status==='correct'&&!correct.has(r.questionId)){correct.add(r.questionId);grant('question:'+r.questionId,config.correct,a.submittedAt,'First correct answer');}
    if(a.kind==='revision')continue;
    completed.add(a.testId);grant('test:'+a.testId,config.completion,a.submittedAt,'First test completion');
    if(a.result.percentage>=80)grant('score80:'+a.testId,config.score80,a.submittedAt,'First score of at least 80%');
    for(const [n,hearts] of Object.entries(config.distinct))if(completed.size>=+n)grant('distinct:'+n,hearts,a.submittedAt,n+' distinct tests');
    for(const [n,message] of Object.entries(messages.milestones))if(completed.size===+n&&!milestones.some(m=>m.id==='message:'+n))milestones.push({id:'message:'+n,message,at:a.submittedAt});
  }
  return {events:[...ledger.values()],hearts:[...ledger.values()].reduce((n,e)=>n+e.hearts,0),milestones};
}
export function levelFor(hearts,levels) {const i=levels.findLastIndex(l=>hearts>=l.threshold);const current=levels[Math.max(0,i)],next=levels[i+1];return {current,next,remaining:next?next.threshold-hearts:0,progress:next?(hearts-current.threshold)/(next.threshold-current.threshold)*100:100};}
