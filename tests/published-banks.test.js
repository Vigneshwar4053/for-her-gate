import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {loadTest} from '../js/question-loader.js';
import {createSession,saveAnswer,navigate,validateSession} from '../js/exam-engine.js';
import {acceptedRanges,inAcceptedRanges} from '../js/nat-ranges.js';
import {scoreTest} from '../js/scoring-engine.js';
import {deriveRewards} from '../js/rewards-engine.js';
import {achievements} from '../js/achievements.js';
import {aggregate,localDay} from '../js/analytics.js';
import {emptyProfile,saveProfile,loadProfile,mergeProfiles} from '../js/storage.js';
import {exportBackup,parseBackup,verifyImported} from '../js/backup.js';
import {solutionHTML} from '../js/solution-viewer.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url))),definitions=read('data/tests.json'),subjects=read('data/subjects.json'),topics=read('data/topics.json'),rewardConfig=read('data/rewards.json'),messages=read('data/messages.json'),badgeConfig=read('data/achievements.json');
const ready=definitions.filter(t=>t.status==='ready');
const answer=q=>q.type==='NAT'?String((acceptedRanges(q)[0][0]+acceptedRanges(q)[0][1])/2):q.correctAnswer;
async function withFetch(fn){const previous=globalThis.fetch,requests=[];globalThis.fetch=async path=>{const url=new URL(path);assert.equal(url.protocol,'file:');requests.push(url.pathname);return new Response(readFileSync(url),{headers:{'Content-Type':'application/json'}});};try{return await fn(requests);}finally{globalThis.fetch=previous;}}
for(const definition of ready)test(`${definition.id}: bank→session→refresh→score→rewards→analytics→backup`,async()=>withFetch(async requests=>{
 const qs=await loadTest(definition,subjects,topics);assert.equal(qs.length,12);assert.equal(new Set(qs.map(q=>q.id)).size,12);assert.equal(requests.length,definition.questionFiles.length,'Only this test bank should be fetched');
 let s=createSession(definition,'timed',Date.now()-60000,'workflow-'+definition.id);
 for(let i=0;i<qs.length;i++){const q=qs[i];saveAnswer(s,q,answer(q));navigate(s,definition,i);assert.equal(solutionHTML(q,{session:s}),'');}
 s=validateSession(structuredClone(s),definition,qs);const result=scoreTest(qs,s.responses,definition.scoring);assert.equal(result.correct,12);assert.equal(result.percentage,100);s.submitted=true;
 for(const q of qs){const html=solutionHTML(q,{session:s});assert.match(html,/Given information/);assert.match(html,/What we’re finding/);assert.match(html,/Final answer/);}
 const profile=emptyProfile(),at=Date.now();profile.attempts=[{id:s.id,testId:definition.id,contentVersion:1,mode:s.mode,startedAt:s.startedAt,submittedAt:at,day:localDay(at),category:definition.category,subject:definition.subject||null,responses:s.responses,timeByQuestion:{},result,valid:true}];
 profile.rewards=deriveRewards(profile.attempts,rewardConfig,messages);assert.equal(profile.rewards.hearts,110);assert.equal(deriveRewards([...profile.attempts,...profile.attempts],rewardConfig,messages).hearts,110);
 const stats=aggregate(profile.attempts);assert.equal(stats.completed,1);assert.equal(stats.attempted,12);assert.equal(stats.accuracy,100);assert.ok(achievements(profile.attempts,badgeConfig).find(b=>b.id==='first').unlocked);
 const mem=new Map(),store={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};saveProfile(profile,store);const restored=loadProfile(store);
 const imported=await verifyImported(parseBackup(exportBackup(restored)),definitions,subjects,topics),merged=mergeProfiles(restored,imported);assert.equal(merged.attempts.length,1);assert.equal(deriveRewards(merged.attempts,rewardConfig,messages).hearts,110);
}));
test('published disjoint-range question scores both solutions, rejects their gap and survives backup',async()=>withFetch(async()=>{
 const def=definitions.find(t=>t.id==='mixed-01'),qs=await loadTest(def,subjects,topics),q=qs.find(q=>q.acceptedRanges);assert.ok(q);
 for(const [lo,hi] of acceptedRanges(q)){const value=(lo+hi)/2;assert.ok(inAcceptedRanges(q,value));assert.equal(scoreTest([q],{[q.id]:String(value)},{mode:'current'}).correct,1);}
 const ranges=acceptedRanges(q),gap=(ranges[0][1]+ranges[1][0])/2;assert.equal(scoreTest([q],{[q.id]:String(gap)},{mode:'current'}).correct,0);
 const s=createSession(def,'learning',Date.now()-1000,'union-roundtrip'),value=String((ranges[1][0]+ranges[1][1])/2);saveAnswer(s,q,value);
 const result=scoreTest(qs,s.responses,def.scoring),p=emptyProfile(),at=Date.now();p.attempts=[{id:s.id,testId:def.id,contentVersion:1,mode:s.mode,category:def.category,subject:null,startedAt:s.startedAt,submittedAt:at,day:localDay(at),responses:s.responses,timeByQuestion:{},result,valid:true}];
 const imported=await verifyImported(parseBackup(exportBackup(p)),definitions,subjects,topics);assert.equal(imported.attempts[0].result.correct,1);assert.equal(imported.attempts[0].responses[q.id],value);
}));
test('all published formulas are balanced and diagrams contain accessible titles',()=>{for(const name of readdirSync(new URL('../data/questions/',import.meta.url))){if(!name.endsWith('.json'))continue;for(const q of read('data/questions/'+name)){for(const value of [q.question,q.solution.formula,...q.solution.steps,...q.options.map(o=>o.text)]){assert.equal((value.match(/\$/g)||[]).length%2,0,q.id);assert.ok(!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value),q.id);}for(const d of q.diagrams||[]){assert.ok(d.alt);assert.match(readFileSync(new URL('../'+d.src,import.meta.url),'utf8'),/<title[ >]/);}}}});
test('every original practice question is used once; subject and mixed tests have real breadth',()=>{const ids=ready.flatMap(t=>t.questionIds);assert.equal(new Set(ids).size,ids.length,'No reused questions padded into multiple ready tests');for(const def of ready){const qs=def.questionFiles.flatMap(read).filter(q=>def.questionIds.includes(q.id));if(def.category==='subject')assert.ok(new Set(qs.map(q=>q.topic)).size>1,def.id);if(def.category==='mixed')assert.ok(new Set(qs.map(q=>q.subject)).size>=5,def.id);}assert.ok(definitions.filter(t=>t.category==='pyq').every(t=>t.status==='pending'));});
test('question loader resolves relative bank paths beneath a GitHub repository prefix',()=>{const base='https://example.github.io/REPOSITORY/js/question-loader.js';for(const def of ready)for(const path of def.questionFiles)assert.ok(new URL('../'+path,base).pathname.startsWith('/REPOSITORY/data/questions/'));});
