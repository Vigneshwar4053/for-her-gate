import {acceptedRanges} from './nat-ranges.js';
import {e,icon,hydrate} from './ui.js';
import {canReveal} from './exam-engine.js';
export function solutionHTML(q,{session=null,open=false}={}) {
 if(session&&!canReveal(session))return '';
 const s=q.solution;
 return `<details class="solution" ${open?'open':''}><summary>View Step-by-Step Solution</summary><div class="solution-content"><h4>Given information</h4><ul>${s.given.map(x=>`<li>${e(x)}</li>`).join('')}</ul><h4>What we’re finding</h4><p>${e(s.asked)}</p><h4>The concept · ${e(s.concept)}</h4><p class="formula">$ ${e(s.formula)} $</p><details open><summary style="background:transparent;padding-left:0">Reasoning & calculations</summary><ol>${s.steps.map(x=>`<li>${e(x)}</li>`).join('')}</ol></details><h4>Final answer</h4><p>${e(s.finalAnswer)} ${q.type==='MCQ'?`· ${e(q.options.find(o=>o.id===q.correctAnswer)?.text)}`:''}</p><p>${e(s.explanation)}</p>${s.diagrams?.map(d=>`<img class="diagram" src="./${e(d.src)}" alt="${e(d.alt)}">`).join('')||''}<h4>A common pitfall</h4><ul>${s.commonMistakes.map(x=>`<li>${e(x)}</li>`).join('')}</ul><p class="small muted">Verification: ${e(q.verification.status)}. ${e(q.verification.method)}</p></div></details>`;
}
export function answerLabel(q,value){if(value===undefined||value===null||value===''||Array.isArray(value)&&!value.length)return 'Unattempted';if(q.type==='NAT')return String(value);return (Array.isArray(value)?value:[value]).map(id=>id+' · '+(q.options.find(o=>o.id===id)?.text||'Invalid choice')).join('; ');}
export function correctLabel(q){return q.type==='NAT'?acceptedRanges(q).map(([lo,hi])=>`${lo} to ${hi}`).join(' OR '):answerLabel(q,q.correctAnswer);}
export function questionHTML(q){return `<div class="exam-question">${e(q.question)}</div>${q.diagrams?.map(d=>`<img class="diagram" src="./${e(d.src)}" alt="${e(d.alt)}">`).join('')||''}`;}
