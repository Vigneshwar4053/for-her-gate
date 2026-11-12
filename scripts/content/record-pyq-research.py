import json,pathlib
P=pathlib.Path(__file__).resolve().parents[2]
def write(p,x):(P/p).write_text(json.dumps(x,indent=2,ensure_ascii=False)+'\n')
# Factual final-key metadata; no official question statements or solutions copied.
mcq1='B A D B B'.split();mcq2='A C C C C'.split()
ec1='A D D C D A C D B A B C A A'.split()
ec2='A A A B B C C C B B B B C A A D B C'.split()
rows=[]
def add(n,kind,key,marks,section='EC'):
 rows.append(dict(number=n,session=7,type=kind,section=section,key=key,marks=marks))
for i,k in enumerate(mcq1,1):add(i,'MCQ',k,1,'GA')
for i,k in enumerate(mcq2,6):add(i,'MCQ',k,2,'GA')
for i,k in enumerate(ec1,11):add(i,'MCQ',k,1)
for i,k in enumerate([['A'],['B','D'],['B'],['A','B'],['C','D']],25):add(i,'MSQ',k,1)
for i,r in enumerate([[.95,1.05],[71.5,72.5],[.95,1.05],[20.5,21.5],[20,21],[4.9,5.1]],30):add(i,'NAT',r,1)
for i,k in enumerate(ec2,36):add(i,'MCQ',k,2)
for i,k in enumerate([['A','B','D'],['C'],['A','D'],['A','B','C'],['A','C','D']],54):add(i,'MSQ',k,2)
for i,r in enumerate([[1386,1386],[2.5,2.6],[.6,.7],[2.9,3.1],[.1,.2],[[-36.5,-34.5],[34.5,36.5]],[3.7,4.3]],59):add(i,'NAT',r,2)
assert [r['number'] for r in rows]==list(range(1,66))
assert sum(r['marks'] for r in rows)==100
write('data/content-reviews/pyq-2026-source-review.json',dict(year=2026,paperCode='EC',keySession=7,reviewStage='key-metadata-inspected-paper-inaccessible',paperUrlsTried=['https://gate2026.iitg.ac.in/doc/download/2026/QPs/EC.pdf','https://gate2027.iitm.ac.in/static/doc/download/2026/QPs/EC.pdf'],keyUrl='https://gate2026.iitg.ac.in/doc/download/2026/Keys/EC_Keys.pdf',paperFetch='Both official web mirrors rejected 14,137,852-byte PDF as too large. Shell curl cannot resolve official host. No paper downloaded.',keyDerivedQuestionCount=65,keyDerivedMarks=100,questionTypes={k:sum(r['type']==k for r in rows) for k in ['MCQ','MSQ','NAT']},keyRows=rows,rights=dict(status='unresolved',finding='Official pages show All Rights Reserved. Research did not establish a license for full paper/diagram reproduction. This is not a determination that permission is impossible; documentary clearance is required by the project.',contactNotSent=True),blockers=['Original paper text and diagrams unavailable to this execution','Full-paper reproduction grant not established','All original question statements, numbering and section structure require paper inspection','All 65 original worked solutions and diagram checks pending','Q64 key permits two disjoint NAT intervals; current single-range schema/engine cannot represent it faithfully'],inputWorkflow='source-input/README.md',humanReviewed=False,independentlyReviewed=False))
tests=json.loads((P/'data/tests.json').read_text());t=next(t for t in tests if t['id']=='pyq-2026');t['session']=7;t['source']['answerVerification']='key-metadata-inspected';t['source']['researchFile']='data/content-reviews/pyq-2026-source-review.json';t['pendingReason']='Official key metadata inspected (65 questions / 100 marks, session 7). Original paper fetches fail size limit; reproduction permission unresolved; full explanations/diagrams pending; Q64 needs two disjoint NAT ranges.';write('data/tests.json',tests)
