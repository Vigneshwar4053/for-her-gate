"""Small-batch authoring helpers. Never changes readiness or existing questions."""
import json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[2]
SOURCES={'mathematics':['https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/','https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/','https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/','https://ocw.mit.edu/courses/18-04-complex-variables-with-applications-spring-2018/resources/lecture-notes/','https://web.mit.edu/people/jnt/prob.html'],'networks':['https://circuits.mit.edu/S26','https://ece3084.ece.gatech.edu/notes/'],'devices':['https://ocw.mit.edu/courses/6-012-microelectronic-devices-and-circuits-fall-2009/'],'analog':['https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/'],'digital':['https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/'],'control':['https://ocw.mit.edu/courses/16-30-feedback-control-systems-fall-2010/'],'communications':['https://ocw.mit.edu/courses/6-450-principles-of-digital-communications-i-fall-2006/'],'electromagnetics':['https://ocw.mit.edu/courses/6-013-electromagnetics-and-applications-fall-2005/'],'aptitude':['https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/']}
class Bank:
 def __init__(self,test,subject,topic,title,batch):
  self.test=test;self.subject=subject;self.topic=topic;self.title=title;self.batch=batch;self.questions=[]
 def add(self,kind,prompt,answer,given,asked,concept,formula,steps,mistake,options=None,difficulty='medium',unit='',topic=None,diagram=None,subject=None):
  n=len(self.questions)+1;qid=f'FH-{self.test.upper()}-{n:02}'
  if isinstance(steps,str):steps=steps.split(' | ')
  assert len(steps)>=3
  rationale={'easy':'Direct application of one governing relationship after identifying the given conditions.','medium':'Requires selecting the governing relationship and combining two or more reasoning or calculation steps.','hard':'Requires a parameter or domain condition, multiple representations, or a nontrivial combination of concepts.'}[difficulty]
  q=dict(id=qid,type=kind,subject=subject or self.subject,topic=topic or self.topic,difficulty=difficulty,difficultyRationale=rationale,marks=1 if difficulty=='easy' else 2,question=prompt,options=[dict(id=chr(65+i),text=s) for i,s in enumerate(options or [])],solution=dict(given=given.split('; '),asked=asked,concept=concept,formula=formula,steps=steps,finalAnswer=(str(answer)+(' '+unit if unit else '')) if kind=='NAT' else ', '.join(answer) if isinstance(answer,list) else answer,explanation=steps[-1],commonMistakes=[mistake]),hints=[f'Identify the conditions under which {concept.lower()} applies.',f'Start from $ {formula} $.'],sourceType='original',sourceUrl=None,sourceYear=None,sourceReferences=SOURCES[subject or self.subject],reusePermission='original-project-content',verified=False,verification=dict(status='draft',answer='pending',solution='pending',method='Pending executable calculation/property checks. Explanations authored by the same system; no external or human review claimed.',evidence=None,automaticallyValidated=False,answerKeyVerified=False,independentlyReviewed=False,humanReviewed=False),contentVersion=1,contentBatch=self.batch)
  if kind=='NAT':
   a=float(answer);tol=max(1e-7,abs(a)*1e-7);q['acceptedRange']=[round(a-tol,12),round(a+tol,12)];q['numericalTolerance']=tol
  else:q['correctAnswer']=answer
  if diagram:q['diagrams']=[dict(src=diagram[0],alt=diagram[1])]
  self.questions.append(q);return q
 def n(self,*args,**kwargs):return self.add('NAT',*args,**kwargs)
 def m(self,prompt,answer,options,*args,**kwargs):return self.add('MCQ',prompt,answer,*args,options=options,**kwargs)
 def s(self,prompt,answer,options,*args,**kwargs):return self.add('MSQ',prompt,answer,*args,options=options,**kwargs)
 def save(self):
  assert len(self.questions)==12,(self.test,len(self.questions))
  path=f'data/questions/{self.test}.json'
  target=ROOT/path
  if target.exists():
   existing=json.loads(target.read_text())
   assert not any(q['verified'] for q in existing),'Never overwrite a released bank. Edit with explicit version/evidence review.'
  target.write_text(json.dumps(self.questions,indent=2,ensure_ascii=False)+'\n')
  return dict(testId=self.test,file=path,title=self.title,batch=self.batch)
def save_batch(banks,name):
 manifest=[b.save() for b in banks];(ROOT/f'scripts/content/{name}.json').write_text(json.dumps(manifest,indent=2)+'\n')
