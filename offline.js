(()=>{'use strict';
function create({onChange=()=>{}}={}){
 const ua=navigator.userAgent||'',platform=/iPad|iPhone|iPod/.test(ua)||(/Mac/.test(ua)&&navigator.maxTouchPoints>1)?'ios':/Android/.test(ua)?'android':'desktop';
 let state={phase:'preparing',cached:0,total:0,version:null,installed:!!navigator.standalone||!!window.matchMedia?.('(display-mode: standalone)').matches,installAvailable:false,inApp:/MicroMessenger|\bQQ\//i.test(ua),platform,online:navigator.onLine!==false,updateAvailable:false};
 let registration=null,promptEvent=null,starting=null;
 function emit(change){state={...state,...change};onChange({...state});}
 function query(worker,type='POCKET_OFFLINE_CHECK'){
  return new Promise((resolve,reject)=>{
   if(!worker){reject(Error('No active offline copy'));return;}
   const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('Offline check timed out'));},type==='POCKET_OFFLINE_REPAIR'?120000:10000);
   channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data);};
   worker.postMessage({type},[channel.port2]);
  });
 }
 async function check(){
  if(!registration?.active||!navigator.serviceWorker.controller)return false;
  try{const result=await query(registration.active);if(result.type!=='POCKET_OFFLINE_STATUS')throw Error('Offline copy unavailable');emit({phase:result.ready?'ready':'error',cached:result.cached,total:result.total,version:result.version});return result.ready;}
  catch{emit({phase:'error'});return false;}
 }
 function watch(worker){
  if(!worker)return;
  worker.addEventListener('statechange',()=>{
   if(worker.state==='activated')check();
   if(worker.state==='installed'&&registration?.active)emit({updateAvailable:true});
   if(worker.state==='redundant'&&!registration?.active)emit({phase:'error'});
  });
 }
 async function begin(){
  if(starting)return starting;
  if(location.protocol==='file:'){emit({phase:'file'});return;}
  if(!window.isSecureContext){emit({phase:'insecure'});return;}
  if(!('serviceWorker' in navigator)||!('caches' in window)){emit({phase:'unsupported'});return;}
  emit({phase:'preparing'});
  starting=(async()=>{
   try{
    // Recover the installed copy locally before any network-dependent registration.
    const scopeURL=new URL('./',location.href).href;
    const existing=await navigator.serviceWorker.getRegistration?.(scopeURL);
    registration=existing?.scope===scopeURL?existing:null;
    if(!registration||(!registration.active&&!registration.installing&&!registration.waiting))registration=await navigator.serviceWorker.register(new URL('sw.js',location.href),{scope:'./',updateViaCache:'none'});
    registration.addEventListener('updatefound',()=>watch(registration.installing));
    watch(registration.installing);watch(registration.waiting);
    if(registration.waiting)emit({updateAvailable:true});
    if(existing===registration&&registration.active&&navigator.onLine!==false)registration.update?.().catch(()=>{});
    if(registration.active){if(await check())return;if(!navigator.serviceWorker.controller)return;
     const result=await query(registration.active,'POCKET_OFFLINE_REPAIR');
     if(result.type==='POCKET_OFFLINE_STATUS')emit({phase:result.ready?'ready':'error',cached:result.cached,total:result.total,version:result.version});else emit({phase:'error'});
    }
   }catch{emit({phase:'error'});}
   finally{starting=null;}
  })();return starting;
 }
 if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('controllerchange',()=>check());
  navigator.serviceWorker.addEventListener('message',event=>{
   if(!registration||![registration.installing,registration.waiting,registration.active,navigator.serviceWorker.controller].filter(Boolean).includes(event.source))return;
   const message=event.data;
   // A new waiting version must not claim the currently running copy is offline-ready.
   if(message?.type==='POCKET_OFFLINE_PROGRESS'&&!registration.active)emit({phase:'preparing',cached:message.cached,total:message.total});
   if(message?.type==='POCKET_OFFLINE_STATUS')check();
   if(message?.type==='POCKET_OFFLINE_ERROR'&&!registration.active)emit({phase:'error'});
  });
 }
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;emit({installAvailable:true});});
 window.addEventListener('appinstalled',()=>{promptEvent=null;emit({installed:true,installAvailable:false});});
 window.addEventListener('online',()=>{emit({online:true});if(state.phase==='error')begin();else check();});
 window.addEventListener('offline',()=>emit({online:false}));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&registration?.active)check();});
 begin();
 return {getState:()=>({...state}),retry:begin,check,
  shareURL:()=>/^https?:$/.test(location.protocol)?new URL('./',location.href).href:null,
  async install(){if(!promptEvent)return false;const event=promptEvent;promptEvent=null;emit({installAvailable:false});await event.prompt();const result=await event.userChoice;return result.outcome==='accepted';}
 };
}
window.PocketOffline={create};
})();
