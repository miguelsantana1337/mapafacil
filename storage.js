/** Persistência local com sincronização Supabase opcional e segura. */
(() => {
  'use strict';
  const INDEX_KEY='mastermind.mapIndex', PREFIX='mastermind.map.', LAST='mastermind.lastOpenedId';
  const readIndex=()=>{try{return JSON.parse(localStorage.getItem(INDEX_KEY))||[]}catch{return[]}};
  const writeIndex=ids=>localStorage.setItem(INDEX_KEY,JSON.stringify(ids));
  const local={
    async listMaps(){return readIndex().map(id=>{try{const raw=localStorage.getItem(PREFIX+id),m=raw&&JSON.parse(raw);return m&&{id:m.id,title:m.title,updatedAt:m.updatedAt,favorite:!!m.favorite}}catch{return null}}).filter(Boolean).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''))},
    async loadMap(id){try{const raw=localStorage.getItem(PREFIX+id);return raw?JSON.parse(raw):null}catch{return null}},
    async saveMap(map){map.updatedAt=new Date().toISOString();localStorage.setItem(PREFIX+map.id,JSON.stringify(map));const ids=readIndex();if(!ids.includes(map.id)){ids.push(map.id);writeIndex(ids)}return map},
    async deleteMap(id){localStorage.removeItem(PREFIX+id);writeIndex(readIndex().filter(x=>x!==id))},
    getLastOpenedId(){return localStorage.getItem(LAST)},setLastOpenedId(id){localStorage.setItem(LAST,id)}
  };
  const config=window.__MASTER_MIND_CONFIG__||{};
  const client=config.supabaseUrl&&config.supabaseAnonKey&&window.supabase?.createClient?window.supabase.createClient(config.supabaseUrl,config.supabaseAnonKey):null;
  let user=null;
  async function refreshUser(){if(!client)return null;const {data}=await client.auth.getUser();user=data.user||null;return user}
  const cloud={
    async listMaps(){const deviceMaps=await local.listMaps();if(!user)return deviceMaps;const {data,error}=await client.from('mind_maps').select('id,title,favorite,updated_at').order('updated_at',{ascending:false});if(error)throw error;const merged=new Map(deviceMaps.map(m=>[m.id,m]));data.forEach(m=>merged.set(m.id,{id:m.id,title:m.title,favorite:m.favorite,updatedAt:m.updated_at}));return [...merged.values()].sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''))},
    async loadMap(id){if(!user)return local.loadMap(id);const {data,error}=await client.from('mind_maps').select('data').eq('id',id).maybeSingle();if(error)throw error;return data?.data||local.loadMap(id)},
    async saveMap(map){await local.saveMap(map);if(!user)return map;const {error}=await client.from('mind_maps').upsert({id:map.id,user_id:user.id,title:map.title,favorite:!!map.favorite,data:map,updated_at:map.updatedAt});if(error)throw error;return map},
    async deleteMap(id){await local.deleteMap(id);if(!user)return;const {error}=await client.from('mind_maps').delete().eq('id',id);if(error)throw error},
    getLastOpenedId:local.getLastOpenedId,setLastOpenedId:local.setLastOpenedId
  };
  const auth={
    available:!!client,get user(){return user},
    async initialize(){await refreshUser();client?.auth.onAuthStateChange(async()=>{await refreshUser();window.dispatchEvent(new CustomEvent('mindauthchange'))});return user},
    async signIn(email){if(!client)throw new Error('Supabase ainda não está configurado.');const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin}});if(error)throw error},
    async signOut(){if(client)await client.auth.signOut();user=null},
    async migrateLocal(){if(!user)return 0;const maps=await local.listMaps();for(const summary of maps){const map=await local.loadMap(summary.id);if(map)await cloud.saveMap(map)}return maps.length}
  };
  window.MindStorage=cloud;window.MindAuth=auth;
})();
