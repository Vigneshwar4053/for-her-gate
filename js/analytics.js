export function localDay(time=Date.now()) { const d=new Date(time);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function dayBefore(day) {const d=new Date(day+'T12:00:00');d.setDate(d.getDate()-1);return localDay(d);}
export function streaks(attempts,now=Date.now()) {
  const days=[...new Set(attempts.filter(a=>a.valid && a.result.correct+a.result.incorrect>0).map(a=>a.day||localDay(a.submittedAt)))].sort();
  let best=0,run=0,prev;for(const day of days){run=prev===dayBefore(day)?run+1:1;best=Math.max(best,run);prev=day;}
  const set=new Set(days);let cursor=localDay(now),current=0;if(!set.has(cursor))cursor=dayBefore(cursor);
  while(set.has(cursor)){current++;cursor=dayBefore(cursor);}return {current,best,days};
}
export function filterAttempts(attempts,{days=0,subject='',topic='',category=''}={},now=Date.now()) {
  return attempts.filter(a=>a.valid && (!days||a.submittedAt>=now-days*86400000) && (!category||a.category===category) && (!subject||a.result.rows.some(r=>r.subject===subject)) && (!topic||a.result.rows.some(r=>r.topic===topic)));
}
export function aggregate(attempts,filters={}) {
  const selected=filterAttempts(attempts,filters);const subjects={},topics={},daily={};let correct=0,attempted=0;
  for(const a of selected){let dailyCount=0;for(const r of a.result.rows){if(filters.subject&&r.subject!==filters.subject||filters.topic&&r.topic!==filters.topic)continue;if(r.status==='unattempted')continue;attempted++;dailyCount++;correct+=r.status==='correct'?1:0;
    for(const [map,key] of [[subjects,r.subject],[topics,r.topic]]){const x=map[key]??={attempted:0,correct:0,time:0,timed:0};x.attempted++;x.correct+=r.status==='correct'?1:0;if(Number.isFinite(a.timeByQuestion?.[r.questionId])){x.time+=a.timeByQuestion[r.questionId];x.timed++;}}}
    const day=a.day||localDay(a.submittedAt);daily[day]=(daily[day]||0)+dailyCount;
  }
  for(const map of [subjects,topics])for(const x of Object.values(map)){x.accuracy=x.attempted?x.correct/x.attempted*100:0;x.averageSeconds=x.timed?x.time/x.timed/1000:null;}
  return {attempts:selected,completed:new Set(selected.filter(a=>a.kind!=='revision').map(a=>a.testId)).size,attempted,correct,accuracy:attempted?correct/attempted*100:0,subjects,topics,daily,streak:streaks(attempts)};
}
export function recommendations(attempts,tests) {
  const {topics}=aggregate(attempts);return Object.entries(topics).filter(([,v])=>v.correct<v.attempted).map(([topic,v])=>({topic,...v,weight:(v.attempted-v.correct)*(1-v.accuracy/100+1),test:tests.find(t=>t.status==='ready'&&(t.topic===topic||t.coveredTopics?.includes(topic)))})).sort((a,b)=>b.weight-a.weight);
}
export function addStudyDay(days,day) {
  if(days.has(day))return 0;days.add(day);let count=1,before=dayBefore(day);
  while(days.has(before)){count++;before=dayBefore(before);}
  const after=new Date(day+'T12:00:00');after.setDate(after.getDate()+1);
  while(days.has(localDay(after))){count++;after.setDate(after.getDate()+1);}return count;
}
