export function mistakeNotebook(attempts,revised=[],bookmarks=[]) {
  const map=new Map();for(const a of [...attempts].filter(a=>a.valid).sort((a,b)=>a.submittedAt-b.submittedAt))for(const r of a.result.rows){
    if(r.status==='incorrect') {const old=map.get(r.questionId);map.set(r.questionId,{...r,testId:a.testId,attemptId:a.id,userAnswer:a.responses[r.questionId],at:a.submittedAt,count:(old?.count||0)+1,revised:revised.includes(r.questionId),bookmarked:bookmarks.includes(r.questionId),recovered:false});}
    if(r.status==='correct'&&map.has(r.questionId))map.get(r.questionId).recovered=true;
  }return [...map.values()];
}
