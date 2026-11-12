import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createSession,saveAnswer,navigate,validateSession,expired} from '../js/exam-engine.js';
import {scoreTest} from '../js/scoring-engine.js';
import {deriveRewards} from '../js/rewards-engine.js';
import {emptyProfile,saveProfile,loadProfile,mergeProfiles} from '../js/storage.js';
import {exportBackup,parseBackup,verifyImported} from '../js/backup.js';
import {startTimer} from '../js/exam-timer.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url)));const tests=read('data/tests.json'),subjects=read('data/subjects.json'),topics=read('data/topics.json'),config=read('data/rewards.json'),messages=read('data/messages.json'),qs=read('data/questions/mathematics.json'),definition=tests.find(t=>t.id==='subject-01');
test('complete exam survives refresh, scores, saves, imports and prevents duplicate rewards',async()=>{
 let s=createSession(definition,'timed',Date.now()-120000,'end-to-end');
 for(let i=0;i<qs.length;i++){const q=qs[i];saveAnswer(s,q,q.type==='NAT'?String((q.acceptedRange[0]+q.acceptedRange[1])/2):q.correctAnswer);navigate(s,definition,i);}
 s=validateSession(JSON.parse(JSON.stringify(s)),definition,qs);const result=scoreTest(qs,s.responses,definition.scoring);assert.equal(result.percentage,100);
 const p=emptyProfile();const at=Date.now();p.attempts.push({id:s.id,testId:definition.id,contentVersion:1,mode:s.mode,category:definition.category,subject:definition.subject,startedAt:s.startedAt,submittedAt:at,responses:s.responses,timeByQuestion:{},result,valid:true});p.rewards=deriveRewards(p.attempts,config,messages);assert.equal(p.rewards.hearts,110);
 const map=new Map(),store={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};saveProfile(p,store);const restored=loadProfile(store);assert.equal(restored.attempts[0].result.correct,12);
 const fetchBefore=globalThis.fetch;globalThis.fetch=async url=>new Response(readFileSync(new URL(url)),{headers:{'Content-Type':'application/json'}});
 try{const imported=await verifyImported(parseBackup(exportBackup(restored)),tests,subjects,topics);assert.equal(imported.attempts[0].result.percentage,100);const merged=mergeProfiles(restored,imported);assert.equal(merged.attempts.length,1);assert.equal(deriveRewards(merged.attempts,config,messages).hearts,110);}finally{globalThis.fetch=fetchBefore;}
});
test('imports recalculate a forged score and reject unavailable test references',async()=>{const p=emptyProfile(),at=Date.now();p.attempts=[{id:'forged',testId:definition.id,contentVersion:1,mode:'learning',startedAt:at-1000,submittedAt:at,responses:{[qs[0].id]:'A'},result:{percentage:100,rows:[]},valid:true}];const before=globalThis.fetch;globalThis.fetch=async url=>new Response(readFileSync(new URL(url)));
 try{const imported=await verifyImported(p,tests,subjects,topics);assert.ok(imported.attempts[0].result.percentage<0);p.attempts[0].testId='pyq-2007';await assert.rejects(()=>verifyImported(p,tests,subjects,topics),/awaiting verification/);}finally{globalThis.fetch=before;}
});
test('timer expires once and cleans up its interval',t=>{t.mock.timers.enable({apis:['setInterval','Date'],now:1000});const s={deadline:3000};let expiry=0,ticks=0;const stop=startTimer(s,()=>ticks++,()=>expiry++);t.mock.timers.tick(5000);assert.equal(expiry,1);const previous=ticks;t.mock.timers.tick(5000);assert.equal(ticks,previous);stop();t.mock.timers.reset();});
test('expired saved sessions cannot gain time by navigating or cloning',()=>{const s=createSession(definition,'timed',1000,'expired');const refreshed=validateSession(JSON.parse(JSON.stringify(s)),definition,qs);navigate(refreshed,definition,4);assert.ok(expired(refreshed,1201000));assert.equal(refreshed.deadline,1201000);});
test('importing an empty submission never makes it eligible for rewards',async()=>{const p=emptyProfile(),at=Date.now(),result=scoreTest(qs,{},definition.scoring);p.attempts=[{id:'empty',testId:definition.id,contentVersion:1,mode:'timed',startedAt:at-1000,submittedAt:at,responses:{},result,valid:false}];const before=globalThis.fetch;globalThis.fetch=async url=>new Response(readFileSync(new URL(url)));
 try{const imported=await verifyImported(p,tests,subjects,topics);assert.equal(imported.attempts[0].valid,false);assert.equal(deriveRewards(imported.attempts,config,messages).hearts,0);}finally{globalThis.fetch=before;}
});
