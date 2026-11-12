import {inAcceptedRanges} from '../js/nat-ranges.js';
import {readFile,writeFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateQuestion,validateTest} from '../js/content-validation.js';
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const [tests,subjects,topics,syllabus]=await Promise.all(['data/tests.json','data/subjects.json','data/topics.json','data/syllabus.json'].map(read));
const evidenceFiles=new Map(),calculationBatches=new Map();
async function evidenceFor(q){const [file,id]=String(q.verification?.evidence||'').split('#');if(!/^data\/(?:batch-verification\.json|content-reviews\/batch-\d{3}\.json)$/.test(file)||id!==q.id)return null;if(!evidenceFiles.has(file))evidenceFiles.set(file,await read(file));return evidenceFiles.get(file).questions.find(ev=>ev.id===q.id);}
const errors=[],warnings=['Computationally checked questions are not independently or human-reviewed.','Interactive PYQ source, rights, answer and solution release gates remain enforced.'];if(syllabus.technicalStatus!=='official-pdf-inspected')warnings.push('Technical taxonomy remains provisional.');const need=(ok,message)=>{if(!ok)errors.push(message);};
const files=(await readdir('data/questions')).filter(f=>f.endsWith('.json'));
const banks=await Promise.all(files.map(f=>read('data/questions/'+f)));const questions=banks.flat(),byId=new Map(questions.map(q=>[q.id,q]));
need(tests.length===150,'Exactly 150 tests required.');need(new Set(tests.map(t=>t.id)).size===150,'Duplicate test IDs.');
for(const [category,count] of Object.entries({pyq:20,topic:80,subject:40,mixed:10}))need(tests.filter(t=>t.category===category).length===count,`Expected ${count} ${category} slots.`);
need(byId.size===questions.length,'Duplicate question IDs.');need(new Set(topics.map(t=>t.id)).size===topics.length,'Duplicate topic IDs.');
const prompts=new Map();
for(const q of questions){const normalized=q.question.toLowerCase().replace(/\s+/g,' ').trim();if(prompts.has(normalized))errors.push(`Duplicate question statement: ${q.id} and ${prompts.get(normalized)}`);prompts.set(normalized,q.id);
 if(q.verified){errors.push(...validateQuestion(q,subjects,topics));let ev;try{ev=await evidenceFor(q);}catch{errors.push(`Unreadable evidence file for ${q.id}`);}need(ev?.status==='passed',`Missing passed evidence for ${q.id}`);const hash=createHash('sha256').update(JSON.stringify({...q,verification:undefined,verified:undefined})).digest('hex');need(ev?.contentHash===hash,`Evidence content hash mismatch for ${q.id}`);
 if(q.contentBatch){try{if(!calculationBatches.has(q.contentBatch)){const module=await import(`./content/checks-${q.contentBatch}.mjs`);calculationBatches.set(q.contentBatch,module['checks'+q.contentBatch]());}const check=calculationBatches.get(q.contentBatch)[q.id];need(!!check,`Missing calculation for ${q.id}`);if(check){if(q.type==='NAT')need(inAcceptedRanges(q,check.value),`Recalculation outside range for ${q.id}`);else need(JSON.stringify(check.value)===JSON.stringify(q.correctAnswer),`Recalculated answer mismatch for ${q.id}`);}}catch(error){errors.push(`Calculation failed for ${q.id}: ${error.message}`);}}}
 for(const d of [...(q.diagrams||[]),...(q.solution?.diagrams||[])]){need(d.src.startsWith('assets/')&&!d.src.includes('..')&&d.alt,`Invalid diagram reference ${q.id}`);try{await stat(d.src);}catch{errors.push(`Missing diagram ${d.src}`);}}
}
for(const t of tests){need(['ready','pending'].includes(t.status),`Invalid status ${t.id}`);need(Number.isFinite(t.durationMinutes)&&t.durationMinutes>0,`Invalid duration ${t.id}`);need(t.targetQuestions===(t.category==='pyq'?65:12),`Invalid slot allocation ${t.id}`);if(t.subject)need(subjects.some(s=>s.id===t.subject),`Invalid subject ${t.id}`);if(t.topic)need(topics.some(x=>x.id===t.topic&&x.subject===t.subject),`Invalid topic ${t.id}`);
 for(const id of t.questionIds)need(byId.has(id),`Unknown question ${id} in ${t.id}`);
 for(const file of t.questionFiles){need(file.startsWith('data/questions/')&&!file.includes('..'),`Invalid bank path ${t.id}`);try{await stat(file);}catch{errors.push(`Missing bank ${file}`);}}
 if(t.status==='ready'){const qs=t.questionIds.map(id=>byId.get(id));if(qs.every(Boolean))errors.push(...validateTest(t,qs,subjects,topics).map(x=>t.id+': '+x));const loaded=(await Promise.all(t.questionFiles.map(read))).flat();need(t.questionIds.every(id=>loaded.some(q=>q.id===id)),`Test bank files do not contain all references: ${t.id}`);}
 if(t.category==='pyq'){need(t.source.archiveUrl&&t.paperCode==='EC'&&t.historical&&t.scoring.mode==='historical',`Missing historical/source tracking ${t.id}`);if(t.status==='pending')need(t.pendingReason,`Pending PYQ needs a reason ${t.id}`);}
}
const ready=tests.filter(t=>t.status==='ready');const fulfilled=ready.reduce((n,t)=>n+t.questionIds.length,0);
const report={generatedAt:new Date().toISOString(),totalTestSlots:tests.length,pyqSlots:20,topicSlots:80,subjectSlots:40,mixedSlots:10,regularTestSlots:130,targetQuestionSlots:tests.reduce((n,t)=>n+t.targetQuestions,0),readyTests:ready.length,readyPYQs:ready.filter(t=>t.category==='pyq').length,pendingTests:tests.length-ready.length,validatedQuestions:questions.filter(q=>q.verified).length,expertReviewedQuestions:questions.filter(q=>q.verification?.status==='expert-reviewed').length,fulfilledQuestionSlots:fulfilled,missingQuestionSlots:2860-fulfilled,unverifiedQuestions:questions.filter(q=>!q.verified).length,syllabusStatus:syllabus.technicalStatus,verification:'Automatic calculation/property checks; independent and human reviews remain pending.',errors,warnings};
report.categoryReadiness=Object.fromEntries(['pyq','topic','subject','mixed'].map(c=>[c,{slots:tests.filter(t=>t.category===c).length,ready:ready.filter(t=>t.category===c).length,pending:tests.filter(t=>t.category===c&&t.status!=='ready').length}]));
report.readyOriginalTests=ready.filter(t=>t.category!=='pyq').length;
report.pendingOriginalTests=tests.filter(t=>t.category!=='pyq'&&t.status!=='ready').length;
report.originalTargetQuestionSlots=1560;
report.remainingOriginalQuestionSlots=1560-ready.filter(t=>t.category!=='pyq').reduce((n,t)=>n+t.questionIds.length,0);
report.automaticallyRecalculatedQuestions=questions.filter(q=>q.verified&&q.verification?.status==='computationally-checked').length;
await writeFile('data/validation-report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1;
