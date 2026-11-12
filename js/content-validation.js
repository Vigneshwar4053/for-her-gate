import {isValidNATRanges} from './nat-ranges.js';
export function validateQuestion(q,subjects,topics) {
  const errors=[];const need=(condition,message)=>{if(!condition)errors.push(`${q?.id||'unknown'}: ${message}`);};
  need(q&&typeof q.id==='string','missing ID');if(!q)return errors;
  need(['MCQ','MSQ','NAT'].includes(q.type),'invalid question type');need([1,2].includes(q.marks),'invalid marks');need(['easy','medium','hard'].includes(q.difficulty),'invalid difficulty');
  need(subjects.some(s=>s.id===q.subject),'invalid subject');need(topics.some(t=>t.id===q.topic&&t.subject===q.subject),'invalid topic');need(typeof q.question==='string'&&q.question.length>10,'missing prompt');
  const s=q.solution;need(s&&Array.isArray(s.given)&&s.given.length&&s.asked&&s.concept&&s.formula&&Array.isArray(s.steps)&&s.steps.length>=3&&s.finalAnswer&&s.explanation&&Array.isArray(s.commonMistakes),'incomplete solution');
  if(q.type==='NAT')need(isValidNATRanges(q),'invalid numerical range');
  else{const ids=q.options?.map(o=>o.id)||[];need(ids.length>=2&&new Set(ids).size===ids.length&&q.options.every(o=>typeof o.text==='string'&&o.text),'invalid options');if(q.type==='MCQ')need(ids.includes(q.correctAnswer),'invalid answer');else need(Array.isArray(q.correctAnswer)&&q.correctAnswer.length>0&&new Set(q.correctAnswer).size===q.correctAnswer.length&&q.correctAnswer.every(a=>ids.includes(a)),'invalid MSQ set');}
  need(q.verified&&['computationally-checked','expert-reviewed'].includes(q.verification?.status)&&q.verification?.answer==='checked'&&q.verification?.solution==='checked'&&q.verification?.evidence,'missing verification evidence');
  need(['original-project-content','cleared'].includes(q.reusePermission),'unresolved content rights');
  if(q.sourceType==='pyq')need(q.sourceUrl&&q.sourceYear&&q.originalQuestionNumber&&q.originalType&&q.originalMarking&&q.verification?.status==='expert-reviewed','incomplete original PYQ metadata');
  return errors;
}
export function validateTest(test,questions,subjects,topics) {
  const errors=[];if(test.status!=='ready')errors.push('This test is awaiting content verification.');
  const expected=test.category==='pyq'?test.historical?.actualQuestionCount:12;
  if(!expected||questions.length!==expected||test.questionIds.length!==expected||new Set(test.questionIds).size!==expected)errors.push('Incomplete question count.');
  if(questions.some((q,i)=>q.id!==test.questionIds[i]))errors.push('Question order mismatch.');
  for(const q of questions){errors.push(...validateQuestion(q,subjects,topics));if(test.subject&&q.subject!==test.subject)errors.push('Question subject differs from test.');if(test.topic&&q.topic!==test.topic)errors.push('Question topic differs from test.');}
  if(test.category==='pyq'){
    if(!test.historical?.verified||!test.source?.paperUrl||!test.source.answerKeyUrl||test.source.reusePermission!=='cleared'||test.source.questionVerification!=='verified'||test.source.answerVerification!=='verified'||!test.scoring.verified)errors.push('PYQ source, rights or historical metadata not verified.');
    if(questions.reduce((n,q)=>n+q.marks,0)!==test.historical.actualMarks)errors.push('Original mark total mismatch.');
  }
  return errors;
}
