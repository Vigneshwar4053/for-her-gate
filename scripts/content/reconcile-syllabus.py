"""Source-mapped topic reconciliation. Preserves every existing identifier."""
from pathlib import Path
import json
P=Path(__file__).resolve().parents[2]
def read(p):return json.loads((P/p).read_text())
def write(p,x):(P/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
url='https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/EC_GATE2027_Syllabus.pdf'
# Topical terms are factual classifications, organized in the app's existing taxonomy.
groups={
'mathematics':{
'linear-algebra':['Vector spaces and bases','Linear dependence and independence','Matrix algebra','Eigenvalues and eigenvectors','Rank','Existence and uniqueness of linear-system solutions'],
'calculus':['Mean value theorems','Integral calculus theorems','Definite and improper integration','Partial derivatives','Extrema','Multiple integrals','Line, surface and volume integration','Taylor expansion'],
'differential-equations':['Linear ODEs','Euler–Cauchy equations','Nonhomogeneous equations','Variation of parameters','Complementary functions and particular integrals','PDEs','Separation of variables','Initial and boundary conditions'],
'vector-analysis':['Planar and spatial vectors','Vector operations','Gradient','Divergence','Curl','Gauss theorem','Green theorem','Stokes theorem'],
'complex-analysis':['Analytic functions','Cauchy integral theorem and formula','Sequences and series','Convergence tests','Taylor and Laurent expansions','Residues'],
'probability-and-statistics':['Mean, median and mode','Standard deviation','Combinatorial probability','Probability distributions','Binomial, Poisson, exponential and normal laws','Joint and conditional probability','Correlation','Regression']},
'networks':{
'circuit-analysis':['Nodal analysis','Mesh analysis','Linear network equations'],
'network-theorems':['Superposition','Thevenin equivalents','Norton equivalents','Reciprocity','Maximum power transfer'],
'ac-steady-state':['Phasors','Sinusoidal steady state','Complex power'],
'network-parameters':['Two-port representations','Wye–delta conversion'],
'transient-analysis':['RL circuits','RC circuits','RLC circuits','Time-domain linear-circuit responses'],
'laplace-transform':['Laplace solution of circuit equations'],
'signals-and-systems':['Continuous-time signal representations','Discrete-time signal representations'],
'lti-systems':['LTI definition and properties','Causality','BIBO stability','Impulse response','Convolution','Poles and zeros','Frequency response','Phase and group delay'],
'fourier-transform':['Continuous-time Fourier transform','Fourier series'],
'sampling':['Nyquist sampling','Reconstruction'],
'discrete-time-transforms':['DTFT','DFT','Z-transform'],
'digital-filter-design':['FIR filters','IIR filters']},
'devices':{
'semiconductor-physics':['Energy bands in solids','Intrinsic and doped semiconductors','Equilibrium concentrations','Direct and indirect band gaps'],
'carrier-transport':['Drift','Diffusion','Mobility','Resistivity','Generation and recombination','Poisson equation','Continuity equation'],
'pn-junctions':['P–N junction electrostatics and operation'],
'diodes':['Zener diode'],
'bjt':['Bipolar junction transistor'],
'mos-capacitor':['MOS capacitor'],
'mosfet':['MOSFET operation','MOSFET scaling'],
'optoelectronic-devices':['LED','Photodiode','Solar cell']},
'analog':{
'diode-circuits':['Clippers','Clampers','Rectifiers'],
'amplifiers':['BJT biasing and amplifiers','MOSFET biasing and amplifiers','AC coupling','Small-signal models','Frequency response','Current mirrors','Differential amplifiers'],
'operational-amplifiers':['Amplifiers','Summing circuits','Differentiation','Integration','Active filters','Schmitt triggers'],
'feedback':['Dominant-pole and Miller compensation','Phase margin'],
'oscillators':['Op-amp oscillators']},
'digital':{
'number-representations':['Binary encodings','Integer encodings','Floating-point encodings'],
'boolean-algebra':['Boolean identities and minimization'],
'logic-gates':['Logic gates','Static CMOS implementation'],
'karnaugh-maps':['Karnaugh-map minimization'],
'combinational-circuits':['Arithmetic logic','Code conversion','Multiplexers','Decoders'],
'sequential-circuits':['Latches','Counters','Shift registers','Finite-state machines','Propagation delay','Setup and hold constraints','Critical-path timing'],
'flip-flops':['Flip-flop operation'],
'data-converters':['Sample-and-hold','ADC','DAC'],
'semiconductor-memories':['ROM','SRAM','DRAM'],
'computer-organization':['Instructions','Addressing modes','ALU','Datapath','Control unit','Instruction pipelining']},
'control':{
'control-components':['Basic components','Feedback principle','Block diagrams','Signal-flow graphs'],
'transfer-functions':['Transfer function'],
 'time-response':['LTI transient analysis','LTI steady state'],
 'stability':['Routh–Hurwitz criterion','Nyquist criterion'],
 'root-locus':['Root-locus construction and interpretation'],
 'frequency-response':['Frequency response','Bode diagrams'],
 'compensators':['Compensator design','PID controllers'],
 'state-space-analysis':['State-variable model','LTI state-equation solution']},
'communications':{
'random-processes':['Autocorrelation','Power spectral density','White noise','LTI filtering of random signals'],
'analog-communication':['AM generation and detection','Angle modulation and detection','AM/FM spectra','Superheterodyne receivers'],
'digital-communication':['PCM','DPCM','ASK','PSK','FSK','QAM','Bandwidth','Intersymbol interference','MAP and ML detection','Matched filters'],
'modulation':['Analog and digital modulation families; classification aid'],
'information-theory':['Entropy','Source coding','Mutual information','Channel capacity'],
'noise':['Signal-to-noise ratio','White-noise properties'],
'probability-of-error':['Bit-error rate','Detection error probability'],
'error-control-coding':['Error correction fundamentals','Hamming codes','CRC']},
'electromagnetics':{
'maxwell-equations':['Differential and integral Maxwell equations','Interpretation','Boundary conditions','Wave equation','Poynting vector'],
'electromagnetic-waves':['Plane waves','Reflection','Refraction','Polarization'],
'wave-propagation':['Phase and group velocities','Propagation in media','Skin depth'],
 'transmission-lines':['Line equations','Characteristic impedance','Matching','Impedance transformation','S-parameters','Smith chart'],
 'waveguides-fibers':['Rectangular waveguides','Circular waveguides','Optical-fiber light propagation'],
 'antennas':['Dipoles','Monopoles','Linear arrays']}}
topics=read('data/topics.json');index={t['id']:t for t in topics}
for section,(subject,entries) in enumerate(groups.items(),1):
 for id,subtopics in entries.items():
  if id not in index:
   t=dict(id=id,subject=subject,title=id.replace('-',' ').title());topics.append(t);index[id]=t
  index[id].update(status='official-2027-mapped',subtopics=subtopics,sourceUrl=url,sourceSection=section,sourcePage=1 if section<=3 else 2)
# Diode Circuits straddles pages 1–2; annotate its exact source page.
index['diode-circuits']['sourcePage']=1
syllabus=read('data/syllabus.json');syllabus.update(technicalStatus='official-pdf-inspected',checkedAt='2026-11-13',technicalSource=url,note='Both pages accessible through web PDF extraction on continuation. Factual topic hierarchy reconciled to eight official sections. Existing IDs retained; overlapping app categories are cross-mappings, not extra official sections.',technicalCoverage=[dict(section=i,subject=s,topics=list(entries)) for i,(s,entries) in enumerate(groups.items(),1)])
for t in topics:
 if t['subject']=='aptitude':t.update(subtopics=syllabus['aptitudeCoverage'].get(t['title'],[]),sourceUrl=syllabus['aptitudeSource'],sourceSection=['verbal-aptitude','quantitative-aptitude','analytical-aptitude','spatial-aptitude'].index(t['id'])+1,sourcePage=1)
subjects=read('data/subjects.json')
for s in subjects:s['status']='official-2027-mapped'
write('data/topics.json',topics);write('data/subjects.json',subjects);write('data/syllabus.json',syllabus)
# Reallocate only empty topic slots that repeated old examples. Ready IDs and all
# original question classifications remain untouched. Allocation spans 80 slots.
tests=read('data/tests.json');allocated={t.get('topic') for t in tests if t['category']=='topic'}
missing=[t for t in topics if t['id'] not in allocated]
spares=[t for t in reversed(tests) if t['category']=='topic' and t['status']=='pending' and sum(1 for x in tests if x.get('topic')==t['topic'] and x['category']=='topic')>1]
for t,topic in zip(spares,missing):t.update(subject=topic['subject'],topic=topic['id'],title=topic['title']+' · Practice 1')
write('data/tests.json',tests)
