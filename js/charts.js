import {e,icon} from './ui.js';
let loading;const instances=new WeakMap();
async function library(){if(globalThis.Chart)return globalThis.Chart;loading??=new Promise(resolve=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.js';s.onload=()=>resolve(globalThis.Chart);s.onerror=()=>resolve(null);document.head.append(s);setTimeout(()=>resolve(null),8000);});return loading;}
export async function chart(el,{labels,values,label,type='line',suffix='%'}){
 if(!el)return;instances.get(el)?.destroy();
 if(!labels.length){el.innerHTML=`<div class="empty-chart">${icon('chart-no-axes-combined')}<h3>Your progress starts here</h3><p>Complete a test to see your ${e(label.toLowerCase())}. Every small step counts.</p></div>`;return;}
 const C=await library();if(!el.isConnected)return;
 const summary=labels.map((l,i)=>`${l}: ${Number(values[i]).toFixed(1)}${suffix}`).join('; ');
 if(!C){el.innerHTML=`<p class="chart-fallback">Chart library unavailable. Your recorded data is shown below.</p><div class="table-scroll"><table><thead><tr><th>Date / category</th><th>${e(label)}</th></tr></thead><tbody>${labels.map((l,i)=>`<tr><td>${e(l)}</td><td>${Number(values[i]).toFixed(1)}${e(suffix)}</td></tr>`).join('')}</tbody></table></div>`;return;}
 el.innerHTML=`<div class="chart-box"><canvas role="img" aria-label="${e(summary)}"></canvas></div><details class="compact-details"><summary>View chart data</summary><p>${e(summary)}</p></details>`;
 const muted=getComputedStyle(document.documentElement).getPropertyValue('--muted').trim();const border=getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
 instances.set(el,new C(el.querySelector('canvas'),{type,data:{labels,datasets:[{label,data:values,borderColor:'#7778de',backgroundColor:type==='bar'?'#9d9ff0':'#7778de12',fill:true,tension:.3,pointRadius:3,borderWidth:2,borderRadius:5}]},options:{responsive:true,maintainAspectRatio:false,animation:matchMedia('(prefers-reduced-motion: reduce)').matches?false:{duration:350},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.parsed.y.toFixed(1)}${suffix}`}}},scales:{x:{grid:{display:false},ticks:{color:muted,font:{size:10}}},y:{grid:{color:border},ticks:{color:muted,font:{size:10}},suggestedMin:0,...(suffix==='%'?{suggestedMax:100}:{})}}}}));
}
