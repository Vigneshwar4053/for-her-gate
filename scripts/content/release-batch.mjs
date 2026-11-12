import {inAcceptedRanges,acceptedRanges} from '../../js/nat-ranges.js';
import {readFile,writeFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {validateQuestion,validateTest} from '../../js/content-validation.js';
const batch=process.argv[2];if(!/^\d{3}$/.test(batch||''))throw Error('Usage: node scripts/content/release-batch.mjs 002');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const {default:unused,...module}=await import(`./checks-${batch}.mjs`);const calculate=module['checks'+batch];assert.equal(typeof calculate,'function');
const calculated=calculate(),manifest=await read(`scripts/content/batch-${batch}.json`),tests=await read('data/tests.json'),subjects=await read('data/subjects.json'),topics=await read('data/topics.json');
const report={batch,checkedAt:new Date().toISOString(),classification:'automatically-validated-and-recalculated',independentlyReviewed:false,humanReviewed:false,answerKeyVerified:false,method:'Offline numerical algorithms, exact enumerations and property checks in scripts/content/checks-'+batch+'.mjs. Explanations authored by the same system; these are not an independent external or human review.',questions:[]};
const pendingWrites=[];
for(const item of manifest){const qs=await read(item.file),t=tests.find(t=>t.id===item.testId);assert.ok(t,'Unknown test');assert.equal(qs.length,12);assert.ok(t.status==='pending'||qs.every(q=>q.contentBatch===batch));
 for(const q of qs){const c=calculated[q.id];assert.ok(c,'Missing executable check '+q.id);if(q.type==='NAT'){assert.ok(Number.isFinite(c.value),q.id);assert.ok(inAcceptedRanges(q,c.value),`${q.id}: computed ${c.value}, accepted ${JSON.stringify(acceptedRanges(q))}`);}else assert.deepEqual(c.value,q.correctAnswer,q.id);
  q.verified=true;Object.assign(q.verification,{status:'computationally-checked',answer:'checked',solution:'checked',automaticallyValidated:true,answerKeyVerified:false,independentlyReviewed:false,humanReviewed:false,method:c.method+'. Arithmetic checked by executable calculation/property fixtures; same-system solution review only.',evidence:`data/content-reviews/batch-${batch}.json#${q.id}`});
  assert.deepEqual(validateQuestion(q,subjects,topics),[],q.id);
  for(const d of q.diagrams||[])await stat(d.src);
  const contentHash=createHash('sha256').update(JSON.stringify({...q,verification:undefined,verified:undefined})).digest('hex');report.questions.push({id:q.id,status:'passed',contentHash,computedValue:c.value,method:c.method,independentlyReviewed:false,humanReviewed:false});
 }
 const released={...t,title:item.title,status:'ready',questionIds:qs.map(q=>q.id),questionFiles:[item.file],coveredTopics:[...new Set(qs.map(q=>q.topic))],difficulty:'mixed',verification:'computationally-checked',pendingReason:null,contentBatch:batch};
 assert.deepEqual(validateTest(released,qs,subjects,topics),[]);if(t.category==='subject')assert.ok(released.coveredTopics.length>1,'Subject tests need multiple topics');if(t.category==='mixed')assert.ok(new Set(qs.map(q=>q.subject)).size>1,'Mixed test needs several subjects');
 Object.assign(t,released);pendingWrites.push([item.file,qs]);
}
// No readiness mutation reaches disk unless the entire batch has passed.
for(const [file,data] of pendingWrites)await writeFile(file,JSON.stringify(data,null,2)+'\n');
await writeFile(`data/content-reviews/batch-${batch}.json`,JSON.stringify(report,null,2)+'\n');
await writeFile('data/tests.json',JSON.stringify(tests,null,2)+'\n');
console.log(`Batch ${batch}: released ${manifest.length} tests, ${report.questions.length} automatically recalculated original questions. No independent/human review claimed.`);
