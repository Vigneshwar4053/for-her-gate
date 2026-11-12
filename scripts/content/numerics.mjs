// Offline calculation tools used only for content checks, never imported by the app.
export function solve(A,b){if(!Array.isArray(A)||A.length!==b.length||!A.every(r=>Array.isArray(r)&&r.length===b.length))throw Error('Linear solver requires a square coefficient matrix');const m=A.map((r,i)=>[...r,b[i]]),n=b.length;for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.abs(m[i][k])>Math.abs(m[p][k]))p=i;if(Math.abs(m[p][k])<1e-12)throw Error('Singular system');[m[p],m[k]]=[m[k],m[p]];const d=m[k][k];for(let j=k;j<=n;j++)m[k][j]/=d;for(let i=0;i<n;i++)if(i!==k){const c=m[i][k];for(let j=k;j<=n;j++)m[i][j]-=c*m[k][j];}}return m.map(r=>r[n]);}
export function rank(A){const m=A.map(r=>r.slice());let k=0;for(let c=0;c<m[0].length&&k<m.length;c++){let p=k;for(let r=k;r<m.length;r++)if(Math.abs(m[r][c])>Math.abs(m[p][c]))p=r;if(Math.abs(m[p][c])<1e-10)continue;[m[p],m[k]]=[m[k],m[p]];const d=m[k][c];for(let j=c;j<m[0].length;j++)m[k][j]/=d;for(let r=k+1;r<m.length;r++){const a=m[r][c];for(let j=c;j<m[0].length;j++)m[r][j]-=a*m[k][j];}k++;}return k;}
export function matmul(A,B){return A.map(r=>B[0].map((_,j)=>r.reduce((n,v,k)=>n+v*B[k][j],0)));}
export function power(A,n){let R=A.map((r,i)=>r.map((_,j)=>+(i===j)));for(let k=0;k<n;k++)R=matmul(R,A);return R;}
export function det(A){if(A.length===1)return A[0][0];return A[0].reduce((n,x,j)=>n+(-1)**j*x*det(A.slice(1).map(r=>r.filter((_,k)=>k!==j))),0);}
export function integrate(f,a,b,n=8192){if(n%2)n++;const h=(b-a)/n;let s=f(a)+f(b);for(let i=1;i<n;i++)s+=(i%2?4:2)*f(a+h*i);return s*h/3;}
export function derivative(f,x,h=1e-4){return (f(x+h)-f(x-h))/(2*h);}
export function rk4(f,y,t,n=4096,t0=0){let x=t0,step=(t-t0)/n;let state=Array.isArray(y)?y.slice():[y];for(let i=0;i<n;i++){const k1=f(x,state),k2=f(x+step/2,state.map((v,j)=>v+step*k1[j]/2)),k3=f(x+step/2,state.map((v,j)=>v+step*k2[j]/2)),k4=f(x+step,state.map((v,j)=>v+step*k3[j]));state=state.map((v,j)=>v+step*(k1[j]+2*k2[j]+2*k3[j]+k4[j])/6);x+=step;}return state;}
export const sum=a=>a.reduce((n,v)=>n+v,0);
export function cadd([a,b],[c,d]){return [a+c,b+d];}
export function cmul([a,b],[c,d]){return [a*c-b*d,a*d+b*c];}
export function cdiv([a,b],[c,d]){return [(a*c+b*d)/(c*c+d*d),(b*c-a*d)/(c*c+d*d)];}
export function contour(f,r,n=32768){let re=0,im=0;for(let i=0;i<n;i++){const t=(i+.5)*2*Math.PI/n,z=[r*Math.cos(t),r*Math.sin(t)],dz=[-r*Math.sin(t)*2*Math.PI/n,r*Math.cos(t)*2*Math.PI/n];const v=cmul(f(z),dz);re+=v[0];im+=v[1];}return [re,im];}
export const close=(a,b,tol=1e-7)=>Math.abs(a-b)<=tol*Math.max(1,Math.abs(b));
export const choices=arr=>arr.flatMap((yes,i)=>yes?[String.fromCharCode(65+i)]:[]);
