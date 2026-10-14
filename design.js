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
