'use strict';
const navigation=[...document.querySelectorAll('header nav a')];
const sections=navigation.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
let frame=false;
function updateNavigation(){
 frame=false;
 const total=document.documentElement.scrollHeight-innerHeight;
 document.documentElement.style.setProperty('--progress',`${total>0?Math.min(100,scrollY/total*100):0}%`);
 let current=null;for(const section of sections)if(section.getBoundingClientRect().top<innerHeight*.35)current=section.id;
 for(const link of navigation){if(link.getAttribute('href')==='#'+current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
}
addEventListener('scroll',()=>{if(!frame){frame=true;requestAnimationFrame(updateNavigation);}},{passive:true});
addEventListener('resize',updateNavigation);updateNavigation();

// One catalog entry creates the portfolio card and the lab entry point.
const cardHost=document.getElementById('project-cards');
const safe=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if(cardHost)cardHost.innerHTML=Object.entries(TOOLS).map(([key,t])=>`<article class="repo" id="tool-${key}"><span class="eyebrow">${safe(t.category)}</span><h3>${safe(t.title||t.name)}</h3><p class="repo-name">${safe(t.repo)}</p><p>${safe(t.summary||t.description)}</p><p class="tool-outputs">${safe(t.outcomes||'Explore the computed results and original implementation.')}</p><div class="repo-actions"><a class="demo-link" href="lab.html?tool=${key}">Open interactive tool <span aria-hidden="true">↗</span><span class="sr-only">: ${safe(t.repo)}</span></a><a class="repo-source" href="https://github.com/Saeid-Tayebi/${safe(t.repo)}">View code on GitHub ↗</a>${t.paper?`<a class="repo-source" href="${safe(t.paper.url)}">${safe(t.paper.label)}</a>`:''}</div></article>`).join('');
