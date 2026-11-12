export const STORAGE_KEY='for-her.profile.v1';
export const emptyProfile=()=>({schemaVersion:1,revision:0,profile:{displayName:'',theme:'system',preferences:{}},attempts:[],sessions:{},bookmarks:[],revised:[],rewards:{events:[],hearts:0,milestones:[]},achievements:[]});
export function validateProfile(p) {
  if(!p||p.schemaVersion!==1)throw new Error('Unsupported backup version. Your existing data has been preserved.');
  if(!p.profile||!['system','light','dark'].includes(p.profile.theme)||typeof p.profile.displayName!=='string'||p.profile.displayName.length>100||!Array.isArray(p.attempts)||!p.sessions||typeof p.sessions!=='object'||Array.isArray(p.sessions)||!Array.isArray(p.bookmarks)||!Array.isArray(p.revised))throw new Error('Invalid profile structure.');
  if(p.attempts.length>20000||JSON.stringify(p).length>15000000)throw new Error('Backup exceeds supported size.');
  const ids=new Set();for(const a of p.attempts){if(!a||typeof a.id!=='string'||ids.has(a.id)||typeof a.testId!=='string'||!Number.isFinite(a.submittedAt)||!Number.isFinite(a.startedAt)||a.submittedAt<a.startedAt||!a.responses||typeof a.responses!=='object'||Array.isArray(a.responses)||!a.result||!Array.isArray(a.result.rows))throw new Error('Invalid or duplicate attempt.');ids.add(a.id);}
  for(const a of p.attempts){if(!['marks','maxMarks','correct','incorrect','unattempted','accuracy','percentage'].every(k=>Number.isFinite(a.result[k]))||a.result.rows.some(r=>!r||typeof r.questionId!=='string'||!['correct','incorrect','unattempted'].includes(r.status)||!Number.isFinite(r.marks)))throw new Error('Invalid attempt scoring data.');}
  if([...p.bookmarks,...p.revised].some(x=>typeof x!=='string'))throw new Error('Invalid revision references.');
  return p;
}
export function migrate(p) {
  // Explicit version dispatch: unknown versions are never reset or rewritten.
  if(p.schemaVersion===1)return validateProfile(p);
  throw new Error('This storage version needs a supported migration. Export it before changing versions.');
}
export function loadProfile(store=globalThis.localStorage) {
  const raw=store.getItem(STORAGE_KEY);if(!raw)return emptyProfile();
  try{return migrate(JSON.parse(raw));}catch(error){throw new Error('Saved progress could not be read. It has not been overwritten. '+error.message);}
}
export function saveProfile(p,store=globalThis.localStorage) {
  validateProfile(p);
  const raw=store.getItem(STORAGE_KEY);
  if(raw){let current;try{current=JSON.parse(raw);}catch{throw new Error('Existing storage is corrupt. Export the raw data before replacing it.');}
    if((current.revision||0)!==(p.revision||0))throw new Error('Progress changed in another tab. Reload this page before saving.');}
  const next=structuredClone(p);next.revision=(p.revision||0)+1;
  try{store.setItem(STORAGE_KEY,JSON.stringify(next));}catch{throw new Error('Browser storage is full or unavailable. Export progress before continuing.');}
  p.revision=next.revision;return p;
}
function canonical(value) {
  if(Array.isArray(value))return value.map(canonical);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
  return value;
}
function attemptIdentity(a) {
  return JSON.stringify(canonical({id:a.id,testId:a.testId,kind:a.kind||'test',contentVersion:a.contentVersion,mode:a.mode,startedAt:a.startedAt,submittedAt:a.submittedAt,responses:a.responses,timeByQuestion:a.timeByQuestion||{}}));
}
export function mergeProfiles(current,incoming) {
  validateProfile(incoming);const p=structuredClone(current);const map=new Map(p.attempts.map(a=>[a.id,a]));
  for(const a of incoming.attempts){if(map.has(a.id)&&attemptIdentity(map.get(a.id))!==attemptIdentity(a))throw new Error('Conflicting attempt ID: '+a.id);map.set(a.id,a);}
  p.attempts=[...map.values()];p.bookmarks=[...new Set([...p.bookmarks,...incoming.bookmarks])];p.revised=[...new Set([...p.revised,...incoming.revised])];
  for(const [id,s] of Object.entries(incoming.sessions))if(!p.sessions[id])p.sessions[id]=s;
  return p;
}
