import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateQuestion,validateTest} from '../js/content-validation.js';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n+'.json',import.meta.url))),subjects=read('subjects'),topics=read('topics'),tests=read('tests'),qs=read('questions/mathematics');
test('catalogue has exact requested distribution and all years',()=>{assert.equal(tests.length,150);for(const [c,n] of Object.entries({pyq:20,topic:80,subject:40,mixed:10}))assert.equal(tests.filter(t=>t.category===c).length,n);assert.deepEqual(tests.filter(t=>t.category==='pyq').map(t=>t.year),Array.from({length:20},(_,i)=>2007+i));});
test('ready content validates and incomplete content cannot start',()=>{const t=tests.find(t=>t.id==='subject-01');assert.deepEqual(validateTest(t,qs,subjects,topics),[]);assert.ok(validateTest(t,qs.slice(1),subjects,topics).length);assert.ok(validateTest({...t,status:'pending'},qs,subjects,topics).length);});
test('missing explanation, invalid answer and missing evidence reject publication',()=>{assert.ok(validateQuestion({...qs[0],solution:{steps:[]}},subjects,topics).length);assert.ok(validateQuestion({...qs[0],correctAnswer:'Z'},subjects,topics).length);assert.ok(validateQuestion({...qs[0],verification:{}},subjects,topics).length);});
test('question formulas have balanced delimiters and no accidental control characters',()=>{for(const bank of ['mathematics','digital','networks'])for(const q of read('questions/'+bank)){const all=[q.question,...q.solution.steps,q.solution.formula];for(const text of all){assert.equal((text.match(/\$/g)||[]).length%2,0,q.id);assert.ok(!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text),q.id);}}});
