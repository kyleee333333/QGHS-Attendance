const CACHE_NAME="qghs-student-portal-shell-v1";
const SHELL=["./","./index.html","./styles.css","./portal.js","./manifest.webmanifest","./icons/icon-192.svg","./icons/icon-512.svg"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(SHELL)));self.skipWaiting();});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=="GET"||url.pathname.includes("/api/"))return;
 if(url.origin!==self.location.origin)return;
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
  if(response.ok&&response.type==="basic"){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}
  return response;
 })));
});
