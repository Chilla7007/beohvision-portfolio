
const D=window.PORTFOLIO_DATA;
const tabs=document.getElementById("tabs");
const gallery=document.getElementById("gallery");
const lightbox=document.getElementById("lightbox");
const lbimg=lightbox.querySelector("img");

function makeCard(p){
  const d=document.createElement("div");
  d.className="card";
  const img=new Image();
  img.loading="lazy";
  img.src=p.url;
  img.alt=p.title||p.album||"Beohvision photography";
  d.appendChild(img);
  d.addEventListener("click",()=>{lbimg.src=p.url;lightbox.classList.add("open");});
  return d;
}
function showCategory(name,button){
  gallery.innerHTML="";
  (D.categories[name]||[]).forEach(p=>gallery.appendChild(makeCard(p)));
  [...tabs.querySelectorAll("button")].forEach(b=>b.classList.remove("active"));
  button.classList.add("active");
}
Object.keys(D.categories).forEach((name,i)=>{
  const b=document.createElement("button");
  b.innerHTML=`<span>0${i+1}</span>${name}`;
  b.addEventListener("click",()=>showCategory(name,b));
  tabs.appendChild(b);
  if(i===0) showCategory(name,b);
});
lightbox.querySelector("button").addEventListener("click",()=>lightbox.classList.remove("open"));
lightbox.addEventListener("click",e=>{if(e.target===lightbox)lightbox.classList.remove("open")});
document.addEventListener("keydown",e=>{if(e.key==="Escape")lightbox.classList.remove("open")});
