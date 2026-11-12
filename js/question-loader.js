import {validateTest} from './content-validation.js';
export async function json(path) {const r=await fetch(new URL('../'+path,import.meta.url));if(!r.ok)throw new Error(`Could not load ${path} (${r.status}). Check your connection.`);return r.json();}
export async function loadTest(test,subjects,topics) {
  if(!test||test.status!=='ready')throw new Error('This examination is awaiting verification.');
  const banks=await Promise.all(test.questionFiles.map(json));const all=banks.flat();const questions=test.questionIds.map(id=>all.find(q=>q.id===id));
  if(questions.some(q=>!q))throw new Error('Question data is incomplete.');
  const errors=validateTest(test,questions,subjects,topics);if(errors.length)throw new Error(errors.join(' '));
  return questions;
}
