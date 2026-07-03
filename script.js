const reveals=document.querySelectorAll('.reveal');
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.1});
reveals.forEach(el=>observer.observe(el));

const sections=[...document.querySelectorAll('.section')];
const navLinks=[...document.querySelectorAll('.header nav a')];
function updatePage(){
  let current=sections[0].id;
  sections.forEach(section=>{if(scrollY>=section.offsetTop-innerHeight*.4)current=section.id});
  navLinks.forEach(link=>link.classList.toggle('active',link.hash===`#${current}`));
}
addEventListener('scroll',updatePage,{passive:true});updatePage();

const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('.header nav');
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',open)});
navLinks.forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));
document.querySelector('#year').textContent=new Date().getFullYear();
