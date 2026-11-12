import {validateProfile,mergeProfiles} from './storage.js';
import {loadTest} from './question-loader.js';
import {scoreTest} from './scoring-engine.js';
import {saveAnswer,validateSession} from './exam-engine.js';
import {localDay} from './analytics.js';
export function exportBackup(profile) {return JSON.stringify({format:'for-her-backup',exportedAt:new Date().toISOString(),profile},null,2);}
export function parseBackup(text) {if(text.length>15000000)throw new Error('Backup is too large.');const x=JSON.parse(text);if(x.format!=='for-her-backup')throw new Error('Not a FOR HER backup.');return validateProfile(x.profile);}
export async function verifyImported(profile,tests,subjects,topics) {
  const p=structuredClone(profile),cache=new Map();
  const get=async id=>{const test=tests.find(t=>t.id===id);if(!cache.has(id))cache.set(id,{test,qs:await loadTest(test,subjects,topics)});return cache.get(id);};
  for(const a of p.attempts){const {test,qs:allQs}=await get(a.testId);const qs=a.kind==='revision'?allQs.filter(q=>Object.hasOwn(a.responses,q.id)):allQs;if(a.kind==='revision'&&qs.length!==1)throw new Error('Revision must contain exactly one question.');if(![undefined,'test','revision'].includes(a.kind)||a.kind==='revision'&&a.mode!=='learning'||a.contentVersion!==1||!['timed','learning'].includes(a.mode)||a.submittedAt>Date.now()+300000)throw new Error('Unsupported attempt version, mode or future date.');
    const s={submitted:false,responses:{}};for(const [id,value] of Object.entries(a.responses)){const q=qs.find(q=>q.id===id);if(!q)throw new Error('Unknown answer reference.');saveAnswer(s,q,value);}
    a.result=scoreTest(qs,s.responses,test.scoring);a.responses=s.responses;a.category=a.kind==='revision'?'revision':test.category;a.subject=test.subject||null;a.valid=a.result.correct+a.result.incorrect>0;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(a.day||'')||!Number.isFinite(Date.parse(a.day+'T12:00:00Z'))||Math.abs(Date.parse(a.day+'T12:00:00Z')-a.submittedAt)>36*3600000)a.day=localDay(a.submittedAt);
    if(!a.timeByQuestion||Object.values(a.timeByQuestion).some(n=>!Number.isFinite(n)||n<0))a.timeByQuestion={};
  }
  for(const [id,s] of Object.entries(p.sessions)){const {test,qs}=await get(s.testId);if(id!==s.testId)throw new Error('Invalid session key.');validateSession(s,test,qs);}
  p.rewards={events:[],hearts:0,milestones:[]};p.achievements=[];return p;
}
export {mergeProfiles};
