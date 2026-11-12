import {json} from './question-loader.js';
import {loadProfile,saveProfile} from './storage.js';
import {deriveRewards,levelFor} from './rewards-engine.js';
import {achievements} from './achievements.js';
import {$,e,icon,hydrate,toast,empty} from './ui.js';
const page=document.body.dataset.page;
const nav=[['index','Dashboard','layout-dashboard'],['practice','Practice','book-open'],['pyqs','PYQs','files'],['progress','Progress','chart-no-axes-combined'],['rewards','Rewards','gift'],['mistakes','Mistakes','notebook-pen'],['settings','Settings','settings-2']];
function rawDownload(){const blob=new Blob([localStorage.getItem('for-her.profile.v1')||''],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='for-her-recovery-raw.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
try{
 const [tests,subjects,topics,rewardConfig,badgeConfig,messages,personalization]=await Promise.all(['tests','subjects','topics','rewards','achievements','messages','personalization'].map(n=>json(`data/${n}.json`)));
 const profile=loadProfile();
 document.title=(nav.find(n=>n[0]===page)?.[1]||'Examination')+' · '+personalization.websiteTitle;
 const contentCounts={ready:tests.filter(t=>t.status==='ready').length,questions:new Set(tests.filter(t=>t.status==='ready').flatMap(t=>t.questionIds)).size,pending:tests.filter(t=>t.status!=='ready').length};
 const ctx={contentCounts,tests,subjects,topics,rewardConfig,badgeConfig,messages,personalization,profile,
  refresh(){this.profile.rewards=deriveRewards(this.profile.attempts,rewardConfig,messages);this.profile.achievements=achievements(this.profile.attempts,badgeConfig);this.level=levelFor(this.profile.rewards.hearts,rewardConfig.levels);},
  save(){this.refresh();saveProfile(this.profile);this.navigation();},
  navigation(){const name=this.profile.profile.displayName||personalization.displayName;
   $('#sidebar').innerHTML=`<a class="brand" href="./index.html"><img src="./assets/heart.svg" alt="">${e(personalization.websiteTitle)}<span style="color:var(--rose)">♡</span></a><div class="brand-sub">YOUR LITTLE STUDY SPACE</div><div class="eyebrow nav-label">Workspace</div><nav class="nav-links">${nav.map(([id,title,i])=>`<a href="./${id}.html" class="${page===id?'active':''}" ${page===id?'aria-current="page"':''}>${icon(i)}${title}</a>`).join('')}</nav><div class="nav-bottom"><div class="note-card">${icon('heart')}<p>${e(personalization.specialMessage)}</p><p style="font-size:10px">Always in your corner.</p></div><div class="sidebar-foot">A dream worth working for. ♡</div></div>`;
   $('#topbar').innerHTML=`<div class="topbar-left"><button class="icon-button mobile-menu" id="menu" aria-label="Toggle navigation" aria-expanded="false">${icon('menu')}</button><span class="breadcrumb">My workspace <span style="padding:0 10px">/</span> <strong>${e(nav.find(n=>n[0]===page)?.[1]||'Examination')}</strong></span></div><div class="topbar-right"><span class="date small muted">${new Date().toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})}</span><a class="hearts" href="./rewards.html">${icon('heart')} ${this.profile.rewards.hearts.toLocaleString()} <span>Hearts</span></a><a class="icon-button" href="./settings.html" aria-label="Appearance and settings">${icon('sun-moon')}</a><div class="avatar" aria-label="Your study profile">${e(name?.[0]?.toUpperCase()||'♡')}</div></div>`;
   $('#menu').onclick=()=>{const open=$('#sidebar').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(open));};hydrate();
  }
 };
 ctx.refresh();document.documentElement.dataset.theme=profile.profile.theme;
 const accent=profile.profile.preferences?.accentTheme||personalization.accentTheme;if(/^#[a-f\d]{6}$/i.test(accent))document.documentElement.style.setProperty('--primary',accent);
 ctx.navigation();
 const modules={index:'dashboard',practice:'library',pyqs:'library',exam:'exam-page',results:'results-page',progress:'progress',rewards:'rewards-page',mistakes:'mistakes-page',settings:'settings'};
 await (await import(`./${modules[page]}.js`)).render(ctx,page);hydrate();
 addEventListener('load',()=>hydrate());
 addEventListener('storage',event=>{if(event.key==='for-her.profile.v1')toast('Progress changed in another tab. Reload before making changes.');});
 document.addEventListener('keydown',ev=>{if(ev.key==='Escape'){$('#sidebar').classList.remove('open');$('#menu')?.setAttribute('aria-expanded','false');}});
}catch(error){$('#main').innerHTML=`<section class="card">${empty('Your study space needs attention',error.message,'<button class="button secondary" id="recover">Download raw saved progress</button> <a class="button" href="./index.html">Try again</a>')}</section>`;$('#recover').onclick=rawDownload;hydrate();console.error(error);}
