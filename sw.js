'use strict';
const VERSION = "6fdecb83926717c8";
const FILES = [{"url":"index.html","sha256":"d8a8b204b65735088443e4c6a14872a294c06bf4d5f9cb97f5a57697602f0317","download":"offline-shell.txt"},{"url":"style.css","sha256":"8f33a632cc19536363d908e15dae1015886b14df8dde21188ca1c1f0499a4bb2"},{"url":"engine.js","sha256":"df2711e24f03658d62f9ce591d766aabbdd571578a1502d232068f8c33680d2a"},{"url":"icons.js","sha256":"86f8135cff86cb01abece7c57f2990b6c65c160b030db9f64c3a6f0df187c6ed"},{"url":"audio.js","sha256":"2fd1ed9d4efdc66c9cbf833aeb9f3396685bb7219a97194119419e62ede4dd61"},{"url":"offline.js","sha256":"ab126385fb62bf8e738b36214823a9a7c00630665d791d0bc2b2a4075a121788"},{"url":"app.js","sha256":"28570145c966d90ec612b7450a2b0c361d039aafee0e3177f2e49dffa133bd17"},{"url":"manifest.webmanifest","sha256":"3cb9317c42b05366b1b904bddaab5e69aa451702356b9aaee2dd2505388c8e7e"},{"url":"assets/visuals/pocket-hero.png","sha256":"bebd04f73a3b3b02efdb80e61354675dde55d8d2d05bde6627d1371ff4aed550"},{"url":"assets/icons/icon-180.png","sha256":"44544544a67632bcf4c694393cada649ef133eedd9653e6107b3f5fafc8fe7e2"},{"url":"assets/icons/icon-192.png","sha256":"4e5fb9c4f9f5fafa8e7c561feb97b9fd97f0fba1cb0f11af61f2851c87742f7d"},{"url":"assets/icons/icon-512.png","sha256":"647323c8ef4a08639695d53af21554b0cac19800fcef8f333eab12a9404d3668"},{"url":"assets/icons/icon-maskable-512.png","sha256":"3500973bdb17f3fd6a10af7fcd19a9890cbc3c08f2b8aa3ee016de128d6918ff"},{"url":"assets/audio/abandon.mp3","sha256":"13649dd87e15d14f049a8567a1fc94adf775ce98bf51477171b4285dd2739d3c"},{"url":"assets/audio/blocked.mp3","sha256":"7307e94e52b991590244e63cc35fe6c1aac5b1c7b833a7cd35bbf9df9a9329fe"},{"url":"assets/audio/clear-jingle.mp3","sha256":"d1e3a79ce8f71c9840028717da93745977fe2ccff72d4b0445bddcd21410f71b"},{"url":"assets/audio/complete-jingle.mp3","sha256":"e3352c113fe2f328863b070a9abe12f18dba7fe643c7671eaf0c0f1d4587ad63"},{"url":"assets/audio/dance-clear-loop.mp3","sha256":"ff7d05c0a4656b8084b1ff336357f5741d99724eb40ffcd1f539ba692e9ea30d"},{"url":"assets/audio/dance-play.mp3","sha256":"363104e46f4db287e44c4d060ab4f43aa595bf48f0deab914f552f96d22d1ee3"},{"url":"assets/audio/dance-retry-loop.mp3","sha256":"4f2b7dc576df69dbcdb687960a67e5dc35cc73156a3336cf75f4a97227522783"},{"url":"assets/audio/error.mp3","sha256":"c2a1544612401a8194b8d13aebaa273d2bdb1c71dff26bfb73e79113db9243a4"},{"url":"assets/audio/failure-jingle.mp3","sha256":"88c40d2be115a957b34ec13fbfad9a12dec07add4781d15a45c70ac897b04495"},{"url":"assets/audio/hint.mp3","sha256":"8b120d0aebaf7e182c0669037f4b3c72a6aa80baea8803025cf209643e2d8c8a"},{"url":"assets/audio/match.mp3","sha256":"37c0293ef8dcd39f36d5e0c5f33e0a78bf725c23258f214f3354d9cfa1cc072a"},{"url":"assets/audio/saved.mp3","sha256":"d80861654bdb3f659d70cbea8e4264cc26d630ec8a318beb096a29dfedf50816"},{"url":"assets/audio/shuffle.mp3","sha256":"da1adbc25c03d5f6bd7c472049e248658fa550e56010b3932af5f03912f38200"},{"url":"assets/audio/start.mp3","sha256":"7efc9c8445581b272ef20fdb346ef199fa58a88f790a1a90695648183d485412"},{"url":"assets/audio/tap.mp3","sha256":"9274a73e210c53b22a51aae646e0b0a9c5513492f81afbf17b85497a61e1545c"},{"url":"assets/audio/undo.mp3","sha256":"7105c8af1ae6e78aa476814d0ecec48a271611005f4ce32b7cff6ae25556e07c"},{"url":"assets/audio/warning.mp3","sha256":"10171aa30716b8844793ebccfe3ade0a52795bfa379b8ba1bfe735a436d0c3cb"}];
const BASE = new URL(self.registration.scope);
const PREFIX = 'pocket-playtest:' + encodeURIComponent(BASE.pathname) + ':';
const CACHE = PREFIX + VERSION;
let downloading = null;
const assetURL = path => new URL(path, BASE).href;

async function broadcast(message) {
  const clients = await self.clients.matchAll({type:'window', includeUncontrolled:true});
  for (const client of clients) client.postMessage(message);
}
async function status() {
  const cache = await caches.open(CACHE);
  const present = await Promise.all(FILES.map(file => cache.match(assetURL(file.url))));
  return {type:'POCKET_OFFLINE_STATUS', version:VERSION, cached:present.filter(Boolean).length,
    total:FILES.length, ready:present.every(Boolean)};
}
async function download() {
  if (downloading) return downloading;
  downloading = (async () => {
    const cache = await caches.open(CACHE);
    let done = 0;
    // Validate every byte before caching, including music not played on the first visit.
    for (const file of FILES) {
      const url = assetURL(file.url);
      if (!await cache.match(url)) {
        const response = await fetch(new Request(assetURL(file.download || file.url), {cache:'reload', credentials:'same-origin', redirect:'error'}));
        if (!response.ok || response.type === 'opaque') throw Error('Offline download failed');
        const bytes = await response.clone().arrayBuffer();
        const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
          n => n.toString(16).padStart(2,'0')).join('');
        if (hash !== file.sha256) throw Error('Incomplete or outdated offline resource');
        // The text shell avoids host-added online-only scripts and canonical HTML redirects.
        await cache.put(url, file.download ? new Response(bytes, {headers:{'Content-Type':'text/html; charset=utf-8'}}) : response);
      }
      done++;
      await broadcast({type:'POCKET_OFFLINE_PROGRESS', version:VERSION, cached:done, total:FILES.length});
    }
    return status();
  })();
  try {return await downloading;} finally {downloading = null;}
}
self.addEventListener('install', event => {
  // Existing players keep their current worker until all its pages have closed.
  event.waitUntil(download().catch(async error => {
    await broadcast({type:'POCKET_OFFLINE_ERROR'});
    throw error;
  }));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
    await broadcast(await status());
  })());
});
self.addEventListener('message', event => {
  if (!['POCKET_OFFLINE_CHECK','POCKET_OFFLINE_REPAIR'].includes(event.data?.type)) return;
  event.waitUntil((async () => {
    let result;
    try {result = event.data.type === 'POCKET_OFFLINE_REPAIR' ? await download() : await status();}
    catch {result = {type:'POCKET_OFFLINE_ERROR'};}
    event.ports?.[0]?.postMessage(result);
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  const path = url.pathname.slice(BASE.pathname.length);
  if (request.mode === 'navigate' && (path === '' || path === 'index.html')) {
    event.respondWith((async () => await (await caches.open(CACHE)).match(assetURL('index.html')) || fetch(request))());
    return;
  }
  if (!FILES.some(file => file.url === path)) return;
  // Queries do not create duplicate copies of the same versioned asset.
  event.respondWith((async () => await (await caches.open(CACHE)).match(assetURL(path)) || fetch(request))());
});
