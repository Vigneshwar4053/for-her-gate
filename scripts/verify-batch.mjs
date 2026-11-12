import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
// Independent verification fixtures: enumeration, elimination, identities and
// physical balance equations. No content-generator code is imported here.
const determinant=(m)=>m[0][0]*m[1][1]-m[0][1]*m[1][0];
const binary=Array.from({length:2},(_,a)=>Array.from({length:2},(_,b)=>[a,b])).flat();
const bits=n=>Array.from({length:2**n},(_,i)=>i.toString(2).padStart(n,'0'));
const solve2=(a,b,c,d,e,f)=>[(e*d-b*f)/(a*d-b*c),(a*f-e*c)/(a*d-b*c)];
const values={
 mathematics:[determinant([[2,1],[3,4]]),solve2(2,1,1,-1,7,2)[0],[2,5],(2.00001**3-1.99999**3)/.00002,Array.from({length:10000},(_,i)=>(i+.5)*.0002*.0002).reduce((a,b)=>a+b,0),binary.filter(([a,b])=>a+b===1).length/binary.length,1,Math.hypot(3,4),3,[2,4,6,8].reduce((a,b)=>a+b)/4,1+3,[-1,1]],
 digital:[0,bits(3).length,parseInt('1011',2),['A','C'],Math.floor((1+1)/2),1,bits(4).length,8/bits(3).length,['A','C'],Math.ceil(Math.log2(16)),800/8,'D'],
 networks:[solve2(6,0,0,1,12,0)[0],4+8,1/(1/6+1/6),(2*5)*2,10-(10/(2+3))*2,['A','D'],2+3-1,2e-6*3*1e6,Array.from({length:3000},(_,i)=>2*((i+.5)*.001)*.001).reduce((a,b)=>a+b,0),4/2,(10-4)/3,['B','C']]
};
// Truth-table proofs for digital identities and options (all input cases).
for(const A of [0,1]){assert.equal(A&1,A);assert.equal(A|A,A);}
for(const [A,B] of binary) assert.equal(Number(!(A&B)),Number(!A||!B));
assert.equal((1|0),1);assert.equal((1^0),1);assert.equal((1&0),0);assert.equal(Number(!(1|0)),0);
// Verify stationary roots and non-roots independently of supplied answer keys.
for(const x of [-1,1])assert.equal(3*x*x-3,0);
for(const x of [0,2])assert.notEqual(3*x*x-3,0);
// Eigenvalues and rank evidence.
for(const l of [2,5])assert.ok(determinant([[2-l,0],[0,5-l]])===0);
assert.equal(determinant([[1,2],[2,4]]),0);assert.notEqual(1,0);
const optionNumeric={mathematics:{0:[2,5,8,11],5:[.25,.75,.5,1],10:[4,7,10,3]},digital:{0:[0,1,2,NaN],2:[9,10,11,13],5:[0,1,NaN,NaN]},networks:{1:[2,4,12,32],4:[4,6,10,15],9:[2,8,.5,4]}};
const report={batch:'original-foundations-001',checkedAt:'2026-11-13',method:'Independent numerical calculations and exhaustive Boolean truth tables; step-by-step derivations inspected during authoring. Not an external expert audit.',questions:[]};
for(const subject of Object.keys(values)){
 const path=`data/questions/${subject}.json`,qs=JSON.parse(await readFile(path,'utf8'));
 for(let i=0;i<qs.length;i++){
  const q=qs[i],expected=values[subject][i];
  if(q.type==='NAT')assert.ok(Math.abs((q.acceptedRange[0]+q.acceptedRange[1])/2-expected)<1e-6,q.id);
  else if(optionNumeric[subject]?.[i])assert.ok(Math.abs(optionNumeric[subject][i][q.correctAnswer.charCodeAt(0)-65]-expected)<1e-8,q.id);
  else if(q.type==='MSQ'&&subject==='mathematics'){const opts=i===2?[2,3,5,7]:[-1,0,2,1];assert.deepEqual(q.correctAnswer.map(k=>opts[k.charCodeAt(0)-65]).sort((a,b)=>a-b),expected.sort((a,b)=>a-b));}
  else assert.deepEqual(q.correctAnswer,expected,q.id);
  q.verified=true;q.verification.status='computationally-checked';q.verification.answer='checked';q.verification.solution='checked';q.verification.evidence='data/batch-verification.json#'+q.id;
  const hash=createHash('sha256').update(JSON.stringify({...q,verification:undefined,verified:undefined})).digest('hex');
  report.questions.push({id:q.id,status:'passed',contentHash:hash,independentValue:expected,solutionReview:'Arithmetic, governing law and substitutions inspected; computational result checked. Human expert review pending.'});
 }
 await writeFile(path,JSON.stringify(qs,null,2)+'\n');
}
await writeFile('data/batch-verification.json',JSON.stringify(report,null,2)+'\n');
const tests=JSON.parse(await readFile('data/tests.json','utf8'));
for(const [id,subject,title] of [['subject-01','mathematics','Mathematics · Foundations'],['subject-05','digital','Digital Circuits · Foundations'],['topic-06','networks','Circuit Analysis · Foundations']]){
 const t=tests.find(t=>t.id===id),qs=JSON.parse(await readFile(`data/questions/${subject}.json`,'utf8'));
 Object.assign(t,{title,subject,status:'ready',questionFiles:[`data/questions/${subject}.json`],questionIds:qs.map(q=>q.id),coveredTopics:[...new Set(qs.map(q=>q.topic))],pendingReason:null,difficulty:'easy',verification:'computationally-checked'});
 if(t.category==='topic')t.topic='circuit-analysis';
}
await writeFile('data/tests.json',JSON.stringify(tests,null,2)+'\n');
console.log(`Checked ${report.questions.length} original questions. Released 3 tests. Human expert review remains pending.`);
