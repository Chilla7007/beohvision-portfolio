const D=window.TEAM_DATA,P=document.querySelector("#portfolio"),A=document.querySelector("#about"),G=document.querySelector("#gallery"),T=document.querySelector("#tabs"),H=document.querySelector("#title"),L=document.querySelector("#lightbox");
const FLICKR_KEY="db9db0b5ecf3c5e4d68a9cbacf0ab95b",FLICKR_USER="85644060@N02";
let current=[],shown=0,BATCH=36,moreBtn=null,currentPerson=null;
const PERSON_SLUG={"莊浩宇":"haoyu","朱悅澤":"zhu"};
const SLUG_PERSON={haoyu:"莊浩宇",zhu:"朱悅澤",chill:"莊浩宇",chute:"朱悅澤"};
const CATEGORY_SLUG={
"舞台演出":"stage","人物・婚禮":"people-wedding","美食":"food","產品攝影":"product","旅行團攝影":"travel","體育攝影":"sports","活動及商業攝影":"event-commercial","形象照":"portrait","廣告看板":"advertising","空拍":"aerial","工作紀錄":"work","街頭攝影":"street"
};
function categoryBase(name){return (name||"").split("｜")[0].trim()}
function categorySlug(name){let base=categoryBase(name);return CATEGORY_SLUG[base]||encodeURIComponent(base)}
function categoryFromSlug(p,slug){if(!slug)return null;return Object.keys(p.categories||{}).find(n=>categorySlug(n)===slug)||null}
function setShareUrl(person,category=null,replace=false){let u=new URL(location.href);u.search="";u.searchParams.set("photographer",PERSON_SLUG[person]||person);if(category)u.searchParams.set("category",categorySlug(category));history[replace?"replaceState":"pushState"]({person,category},"",u)}
function setHomeUrl(replace=false){let u=new URL(location.href);u.search="";history[replace?"replaceState":"pushState"]({home:true},"",u)}
function setAboutUrl(replace=false){let u=new URL(location.href);u.search="";u.searchParams.set("about","beohvision");history[replace?"replaceState":"pushState"]({about:true},"",u)}
function shuffledCopy(arr){let out=[...(arr||[])];for(let i=out.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function photo(p){let f=document.createElement("figure");f.className="photo";let i=new Image();i.loading="lazy";i.decoding="async";i.src=p.url;i.alt=p.title||"攝影作品";f.append(i);f.onclick=()=>{L.querySelector("img").src=p.url;L.classList.add("open");document.body.classList.add("no-scroll")};return f}
function renderMore(){let end=Math.min(shown+BATCH,current.length);for(;shown<end;shown++)G.append(photo(current[shown]));if(moreBtn)moreBtn.remove();if(shown<current.length){moreBtn=document.createElement("button");moreBtn.className="load-more";moreBtn.textContent=`顯示更多作品（${shown} / ${current.length}）`;moreBtn.onclick=renderMore;G.after(moreBtn)}}
function render(arr){G.innerHTML="";if(moreBtn)moreBtn.remove();current=arr||[];shown=0;if(!current.length){G.innerHTML='<p class="loading-note">作品載入中…</p>';return}renderMore()}
function bioHtml(p){return `<div class="bio">${p.bio.map(x=>`<span>${x}</span>`).join("")}</div>`}
function linksHtml(person,p){let links=[];if(p.links?.instagram)links.push(`<a class="info-link" href="${p.links.instagram}" target="_blank" rel="noopener">Instagram ↗︎</a>`);if(person==="莊浩宇"&&p.links?.youtube)links.push(`<a class="info-link" href="${p.links.youtube}" target="_blank" rel="noopener">動態攝影與剪輯・YouTube ↗︎</a>`);return links.length?`<div class="photographer-links">${links.join("")}</div>`:""}
async function flickr(method,params={}){let u=new URL("https://www.flickr.com/services/rest/");Object.entries({method,api_key:FLICKR_KEY,format:"json",nojsoncallback:"1",...params}).forEach(([k,v])=>u.searchParams.set(k,v));let r=await fetch(u);return r.json()}
async function albumByExactTitle(title){let page=1,sets=[];do{let j=await flickr("flickr.photosets.getList",{user_id:FLICKR_USER,page,per_page:500});sets.push(...(j.photosets?.photoset||[]));if(page>=(j.photosets?.pages||1))break;page++}while(page<10);return sets.find(a=>(a.title?._content||a.title)===title)}
async function loadAlbum(title){let a=await albumByExactTitle(title);if(!a)return[];let all=[],page=1;do{let j=await flickr("flickr.photosets.getPhotos",{photoset_id:a.id,user_id:FLICKR_USER,page,per_page:500,extras:"url_m,url_z,url_c,date_taken"});let ps=j.photoset?.photo||[];all.push(...ps.map(x=>({id:x.id,url:x.url_z||x.url_c||x.url_m,title:x.title||"",album:title,date_taken:x.datetaken||""})).filter(x=>x.url));if(page>=(j.photoset?.pages||1))break;page++}while(page<30);return all}
async function loadProductAlbums(){
  const titles=["商品攝影｜Agape｜高爾夫球","商品攝影｜蕎唯股份有限公司"];
  const groups=await Promise.all(titles.map(loadAlbum));
  return groups.flat();
}
async function setProfilePhoto(id,photoId,pos){try{let j=await flickr("flickr.photos.getSizes",{photo_id:photoId});let sizes=j.sizes?.size||[];let best=[...sizes].reverse().find(x=>+x.width>=800)||sizes.at(-1);let el=document.getElementById(id);if(el&&best){el.src=best.source;el.style.objectPosition=pos}}catch(e){}}
function addTab(name,arr,loader){let b=document.createElement("button");b.textContent=name.split("｜")[0];b.dataset.category=name;b.onclick=async(e)=>{document.querySelector("#category-external")?.remove();T.querySelectorAll("button").forEach(q=>q.classList.remove("active"));b.classList.add("active");if(loader){render([]);try{let x=await loader();render(x)}catch(err){G.innerHTML='<p class="loading-note">Flickr 作品暫時無法載入，請稍後再試。</p>'}}else render(arr);if(currentPerson==="莊浩宇"&&categoryBase(name)==="產品攝影"&&D.photographers["莊浩宇"].links?.product_video){let x=document.createElement("div");x.id="category-external";x.className="category-external";x.innerHTML=`<div class="product-service-copy"><strong>PRODUCT PHOTOGRAPHY</strong><span>商品靜態攝影・情境攝影・品牌視覺</span><small>從產品質感、材質細節到實際使用情境，提供品牌商品影像製作。</small></div><a class="product-motion-link" href="${D.photographers["莊浩宇"].links.product_video}" target="_blank" rel="noopener"><span>MOTION / 商品廣告短片 ↗︎</span><small>Product Commercial Film</small></a>`;T.after(x)}if(!window.__routeLoading)setShareUrl(currentPerson,name);let y=T.getBoundingClientRect().bottom+window.scrollY;if(e?.isTrusted)window.scrollTo({top:Math.max(P.offsetTop-70,y-120),behavior:"smooth"})};T.append(b);return b}
async function show(person,requestedCategory=null,updateUrl=true){currentPerson=person;document.body.classList.remove("about-open");A.classList.add("hidden");document.body.classList.add("portfolio-open");document.querySelector(".welcome").style.display="none";document.querySelector(".choices").style.display="none";P.classList.remove("hidden");G.innerHTML="";T.innerHTML="";let p=D.photographers[person];
if(person==="朱悅澤"){H.innerHTML=`<h1>攝影師｜朱悅澤<span class="photographer-name-en">CHUTE · PORTRAIT PHOTOGRAPHER</span></h1><p>人像攝影｜攝影棚人像・人物形象・風格創作</p>${bioHtml(p)}${linksHtml(person,p)}`;if(updateUrl)setShareUrl(person);render([]);try{render(await loadAlbum(p.flickr_album_exact))}catch(e){G.innerHTML='<p class="loading-note">Flickr 作品暫時無法載入，請稍後再試。</p>'}}
else{H.innerHTML=`<h1>攝影師｜莊浩宇<span class="photographer-name-en">CHILL · COMMERCIAL / EVENT / PERFORMANCE PHOTOGRAPHER</span></h1><p>商業攝影｜產品攝影・舞台演出・活動紀錄</p>${bioHtml(p)}${linksHtml(person,p)}`;let first=null,target=null;Object.entries(p.categories).forEach(([name,arr])=>{let loader=name.startsWith("工作紀錄")?()=>loadAlbum(p.flickr_work_album_exact):(categoryBase(name)==="產品攝影"?()=>loadProductAlbums():null);let b=addTab(name,arr,loader);if(!first)first=b;if(requestedCategory===name)target=b});window.__routeLoading=!updateUrl;(target||first)?.click();window.__routeLoading=false;if(updateUrl&&requestedCategory)setShareUrl(person,requestedCategory);else if(updateUrl&&!requestedCategory&&first)setShareUrl(person,first.dataset.category)}
window.scrollTo({top:0,behavior:updateUrl?"smooth":"auto"})}
document.querySelector("#shuffle").onclick=()=>{if(!current.length)return;render(shuffledCopy(current));G.scrollIntoView({behavior:"smooth",block:"start"})};
function showHome(updateUrl=true){currentPerson=null;document.body.classList.remove("portfolio-open","about-open");A.classList.add("hidden");P.classList.add("hidden");document.querySelector(".welcome").style.display="block";document.querySelector(".choices").style.display="grid";if(updateUrl)setHomeUrl();window.scrollTo({top:0,behavior:updateUrl?"smooth":"auto"})}
let aboutWorkLoaded=false;
async function loadAboutWork(){
  const box=document.querySelector("#about-work-gallery");
  if(!box||aboutWorkLoaded)return;
  box.innerHTML='<p class="loading-note">Flickr 工作紀錄載入中…</p>';
  try{
    const title=D.photographers["莊浩宇"].flickr_work_album_exact||"工作紀錄";
    const arr=await loadAlbum(title);
    if(!arr.length){box.innerHTML='<p class="loading-note">目前找不到 Flickr「工作紀錄」相簿內容。</p>';return;}
    box.innerHTML="";
    arr.forEach(p=>box.append(photo(p)));
    aboutWorkLoaded=true;
  }catch(e){
    box.innerHTML='<p class="loading-note">Flickr 工作紀錄暫時無法載入，請重新整理後再試。</p>';
  }
}
function showAbout(updateUrl=true){currentPerson=null;document.body.classList.remove("portfolio-open");document.body.classList.add("about-open");P.classList.add("hidden");document.querySelector(".welcome").style.display="none";document.querySelector(".choices").style.display="none";A.classList.remove("hidden");if(updateUrl)setAboutUrl();loadAboutWork();window.scrollTo({top:0,behavior:updateUrl?"smooth":"auto"})}
document.querySelectorAll(".choice").forEach(b=>b.onclick=()=>show(b.dataset.person));document.querySelector("#back").onclick=()=>showHome(true);document.querySelector("#about-back").onclick=()=>showHome(true);document.querySelectorAll(".about-link").forEach(b=>b.onclick=()=>showAbout(true));document.querySelector("#home-logo").onclick=()=>showHome(true);
const aboutWorkJump=document.querySelector("#about-work-jump");if(aboutWorkJump)aboutWorkJump.onclick=()=>{loadAboutWork();document.querySelector("#about-work")?.scrollIntoView({behavior:"smooth",block:"start"})};
async function applyRoute(){let q=new URLSearchParams(location.search);if(q.get("about")==="beohvision"){showAbout(false);return}let person=SLUG_PERSON[q.get("photographer")];if(!person){showHome(false);return}let p=D.photographers[person],cat=person==="莊浩宇"?categoryFromSlug(p,q.get("category")):null;window.__routeLoading=true;await show(person,cat,false);window.__routeLoading=false}
window.addEventListener("popstate",applyRoute);
applyRoute();function closeLightbox(){L.classList.remove("open");document.body.classList.remove("no-scroll")}L.querySelector("button").onclick=closeLightbox;L.onclick=e=>{if(e.target===L)closeLightbox()};document.addEventListener("keydown",e=>{if(e.key==="Escape")closeLightbox()});
setProfilePhoto("profile-haoyu","55569796718","50% 50%");setProfilePhoto("profile-zhu","55569690256","50% 50%");

/* Shareable portfolio URLs — photographer + category */
