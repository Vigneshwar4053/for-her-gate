import {hasAnswer, numericAnswer} from './scoring-engine.js';
export const CONTENT_VERSION = 1;
export function createSession(test, mode='timed', now=Date.now(), id=globalThis.crypto.randomUUID()) {
  if (test.status !== 'ready' || test.questionIds.length !== (test.category==='pyq'?test.historical?.actualQuestionCount:test.targetQuestions)) throw new Error('This test is not ready.');
  if (!['timed','learning'].includes(mode)) throw new Error('Unknown practice mode.');
  return {id,testId:test.id,contentVersion:CONTENT_VERSION,mode,startedAt:now,deadline:mode==='timed'?now+test.durationMinutes*60000:null,index:0,responses:{},visited:[test.questionIds[0]],review:[],timeByQuestion:{},submitted:false};
}
export function saveAnswer(session, question, value) {
  if (session.submitted) throw new Error('This examination has been submitted.');
  if (question.type==='NAT' && hasAnswer(value) && numericAnswer(value)===null) throw new Error('Enter a finite number, such as −2.5 or 1e3.');
  if (question.type==='MCQ' && hasAnswer(value) && !question.options.some(o=>o.id===value)) throw new Error('Invalid option.');
  if (question.type==='MSQ' && (!Array.isArray(value) || new Set(value).size!==value.length || !value.every(v=>question.options.some(o=>o.id===v)))) throw new Error('Invalid choices.');
  session.responses[question.id]=value;
  return session;
}
export function navigate(session,test,index) {
  session.index=Math.min(Math.max(0,index),test.questionIds.length-1);
  const id=test.questionIds[session.index];
  if (!session.visited.includes(id)) session.visited.push(id);
  return session;
}
export function toggleReview(s,id) { s.review=s.review.includes(id)?s.review.filter(x=>x!==id):[...s.review,id]; return s; }
export function clearResponse(s,id) {delete s.responses[id];return s;}
export function questionStatus(s,id) {
  const answered=hasAnswer(s.responses[id]);
  if(s.review.includes(id)) return answered?'review-answered':'review';
  return answered?'answered':s.visited.includes(id)?'unanswered':'unvisited';
}
export function remaining(s,now=Date.now()) {return s.deadline===null?null:Math.max(0,s.deadline-now);}
export function expired(s,now=Date.now()) {return s.deadline!==null && now>=s.deadline;}
export function canReveal(s) {return s.mode==='learning'||s.submitted;}
export function validateSession(s,test,questions) {
  if(!s || typeof s.id!=='string' || !s.id || !s.responses || typeof s.responses!=='object' || Array.isArray(s.responses) || s.contentVersion!==CONTENT_VERSION || s.testId!==test.id || s.submitted || !['timed','learning'].includes(s.mode) || !Number.isFinite(s.startedAt) || !Number.isInteger(s.index) || s.index<0 || s.index>=questions.length) throw new Error('Incompatible saved session. Export progress before resetting it.');
  if(s.mode==='timed' && s.deadline!==s.startedAt+test.durationMinutes*60000 || s.mode==='learning' && s.deadline!==null) throw new Error('Invalid saved deadline.');
  if(s.timeByQuestion&&Object.values(s.timeByQuestion).some(t=>!Number.isFinite(t)||t<0))throw new Error('Invalid question timing data.');
  if(!Array.isArray(s.visited)||!Array.isArray(s.review)||[...s.visited,...s.review,...Object.keys(s.responses)].some(id=>!test.questionIds.includes(id))) throw new Error('Invalid saved question references.');
  for(const q of questions) if(Object.hasOwn(s.responses,q.id))saveAnswer(s,q,s.responses[q.id]);
  return s;
}
