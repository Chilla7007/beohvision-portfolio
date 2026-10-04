const D=window.TEAM_DATA,P=document.querySelector("#portfolio"),G=document.querySelector("#gallery"),T=document.querySelector("#tabs"),H=document.querySelector("#title"),L=document.querySelector("#lightbox");
let current=[],shown=0,BATCH=36,moreBtn=null;
function photo(p){let f=document.createElement("figure");f.className="photo";let i=new Image();i.loading="lazy";i.decoding="async";i.src=p.url;i.alt=p.title||"攝影作品";f.append(i);f.onclick=()=>{L.querySelector("img").src=p.url;L.classList.add("open");document.body.classList.add("no-scroll")};return f}
function renderMore(){let end=Math.min(shown+BATCH,current.length);for(;shown<end;shown++)G.append(photo(current[shown]));if(moreBtn)moreBtn.remove();if(shown<current.length){moreBtn=document.createElement("button");moreBtn.className="load-more";moreBtn.textContent=`顯示更多作品（${shown} / ${current.length}）`;moreBtn.onclick=renderMore;G.after(moreBtn)}}
function render(arr){G.innerHTML="";if(moreBtn)moreBtn.remove();current=arr;shown=0;renderMore()}
function show(person){document.querySelector(".welcome").style.display="none";document.querySelector(".choices").style.display="none";P.classList.remove("hidden");G.innerHTML="";T.innerHTML="";
if(person==="朱悅澤"){let p=D.photographers[person];H.innerHTML=`<h1>攝影師｜朱悅澤</h1><p>人像攝影｜攝影棚人像・人物形象・風格創作</p>`;render(p.photos)}
else{let p=D.photographers[person];H.innerHTML=`<h1>攝影師｜莊浩宇</h1><p>活動攝影｜舞台演出・舞蹈表演・活動紀錄</p>`;let entries=Object.entries(p.categories);
entries.forEach(([name,arr],idx)=>{let b=document.createElement("button");b.textContent=name.split("｜")[0];b.onclick=()=>{render(arr);T.querySelectorAll("button").forEach(q=>q.classList.remove("active"));b.classList.add("active");window.scrollTo({top:P.offsetTop-70,behavior:"smooth"})};T.append(b);if(idx===0)b.click()})}
window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll(".choice").forEach(b=>b.onclick=()=>show(b.dataset.person));
document.querySelector("#back").onclick=()=>{P.classList.add("hidden");document.querySelector(".welcome").style.display="block";document.querySelector(".choices").style.display="grid";window.scrollTo({top:0,behavior:"smooth"})};
function closeLightbox(){L.classList.remove("open");document.body.classList.remove("no-scroll")}
L.querySelector("button").onclick=closeLightbox;L.onclick=e=>{if(e.target===L)closeLightbox()};document.addEventListener("keydown",e=>{if(e.key==="Escape")closeLightbox()});
