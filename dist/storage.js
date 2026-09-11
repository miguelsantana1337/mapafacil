/**
 * Storage adapter layer.
 *
 * app.js only ever calls the methods on `window.MindStorage`. Today that's
 * the localStorage-backed adapter below. To move to Supabase later, write a
 * second adapter with the exact same method names/signatures (each already
 * returns a Promise) that reads/writes rows in a `maps` table instead —
 * e.g. `{ id uuid, user_id uuid, title text, data jsonb, updated_at timestamptz }`
 * — and swap the final assignment to `window.MindStorage` at the bottom of
 * this file. Nothing in app.js needs to change.
 *
 * Map shape: { id, title, nodes, rootId, updatedAt }
 */
(() => {
  'use strict';

  const INDEX_KEY = 'mastermind.mapIndex';
  const MAP_KEY_PREFIX = 'mastermind.map.';
  const LAST_OPENED_KEY = 'mastermind.lastOpenedId';

  function readIndex() {
    try { return JSON.parse(localStorage.getItem(INDEX_KEY)) || []; }
    catch (e) { return []; }
  }
  function writeIndex(ids) { localStorage.setItem(INDEX_KEY, JSON.stringify(ids)); }

  const localAdapter = {
    async listMaps() {
      return readIndex()
        .map(id => {
          const raw = localStorage.getItem(MAP_KEY_PREFIX + id);
          if (!raw) return null;
          const m = JSON.parse(raw);
          return { id: m.id, title: m.title, updatedAt: m.updatedAt, favorite: !!m.favorite };
        })
        .filter(Boolean)
        .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    },

    async loadMap(id) {
      const raw = localStorage.getItem(MAP_KEY_PREFIX + id);
      return raw ? JSON.parse(raw) : null;
    },

    async saveMap(map) {
      map.updatedAt = new Date().toISOString();
      localStorage.setItem(MAP_KEY_PREFIX + map.id, JSON.stringify(map));
      const ids = readIndex();
      if (!ids.includes(map.id)) { ids.push(map.id); writeIndex(ids); }
      return map;
    },

    async deleteMap(id) {
      localStorage.removeItem(MAP_KEY_PREFIX + id);
      writeIndex(readIndex().filter(x => x !== id));
    },

    getLastOpenedId() { return localStorage.getItem(LAST_OPENED_KEY); },
    setLastOpenedId(id) { localStorage.setItem(LAST_OPENED_KEY, id); },
  };

  window.MindStorage = localAdapter;
})();
