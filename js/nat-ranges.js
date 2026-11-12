// Single authoritative normalization for runtime scoring and content validation.
// acceptedRanges, when explicitly present, takes precedence over acceptedRange.
export function isValidNATRanges(question) {
  const ranges=Object.hasOwn(question,'acceptedRanges')?question.acceptedRanges:[question.acceptedRange];
  return Array.isArray(ranges)&&ranges.length>0&&ranges.every(r=>Array.isArray(r)&&r.length===2&&r.every(Number.isFinite)&&r[0]<=r[1]);
}
export function acceptedRanges(question) {
  if(!isValidNATRanges(question))throw new Error('Invalid NAT accepted ranges. Each interval needs finite ordered endpoints.');
  const ranges=Object.hasOwn(question,'acceptedRanges')?question.acceptedRanges:[question.acceptedRange];
  return ranges.map(r=>r.slice());
}
export function inAcceptedRanges(question,value) {
  const ranges=acceptedRanges(question);
  if(!Number.isFinite(value))return false;
  // Compare against each endpoint at its own magnitude. A huge upper bound must
  // not widen a near-zero lower bound, and separated intervals never fill a gap.
  const near=(a,b)=>Math.abs(a-b)<=Number.EPSILON*4*Math.max(Math.abs(a),Math.abs(b));
  return ranges.some(([lo,hi])=>(value>=lo||near(value,lo))&&(value<=hi||near(value,hi)));
}
