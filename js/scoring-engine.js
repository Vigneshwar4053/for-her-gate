import {inAcceptedRanges} from './nat-ranges.js';
export function hasAnswer(answer) {
  return Array.isArray(answer) ? answer.length > 0 : answer !== undefined && answer !== null && String(answer).trim() !== '';
}
export function numericAnswer(value) {
  const s = String(value ?? '').trim();
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s) && Number.isFinite(Number(s)) ? Number(s) : null;
}
export function scoreQuestion(q, answer, config = {mode:'current'}) {
  const attempted = hasAnswer(answer);
  if (config.mode === 'historical' && (!config.verified || !q.originalMarking)) throw new Error('Historical marking has not been verified.');
  if (!attempted) return {status:'unattempted',marks:0};
  let correct = false;
  if (q.type === 'MCQ') correct = answer === q.correctAnswer;
  if (q.type === 'MSQ') correct = Array.isArray(answer) && new Set(answer).size === answer.length && answer.length === q.correctAnswer.length && q.correctAnswer.every(a => answer.includes(a));
  if (q.type === 'NAT') {
    const n = numericAnswer(answer);
    correct = n !== null && inAcceptedRanges(q,n);
  }
  const penalty = config.mode === 'historical' ? q.originalMarking.incorrectPenalty : q.type === 'MCQ' ? q.marks / 3 : 0;
  return {status:correct?'correct':'incorrect',marks:correct?q.marks:penalty?-penalty:0};
}
export function scoreTest(questions, responses, config) {
  const rows = questions.map(q => ({questionId:q.id, subject:q.subject, topic:q.topic, ...scoreQuestion(q,responses[q.id],config)}));
  const marks = rows.reduce((n,r)=>n+r.marks,0), maxMarks = questions.reduce((n,q)=>n+q.marks,0);
  const correct = rows.filter(r=>r.status==='correct').length, incorrect=rows.filter(r=>r.status==='incorrect').length;
  return {rows,marks,maxMarks,correct,incorrect,unattempted:questions.length-correct-incorrect,accuracy:correct+incorrect ? correct/(correct+incorrect)*100:0,percentage:maxMarks?marks/maxMarks*100:0};
}
