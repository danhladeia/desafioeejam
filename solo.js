const KEY='eejam-solo-v1';
export function soloHistory(){try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(value)?value.filter(x=>x&&typeof x.gameId==='string'&&Number.isFinite(x.points)&&Number.isFinite(x.correct)).slice(-100):[]}catch{return []}}
export function saveSoloResult(result){const entry={...result,at:Date.now()},rows=[...soloHistory(),entry].slice(-100);try{localStorage.setItem(KEY,JSON.stringify(rows));return true}catch{return false}}
export function soloRanking(gameId,difficulty){return soloHistory().filter(x=>x.gameId===gameId&&x.difficulty===difficulty).sort((a,b)=>b.correct-a.correct||b.points-a.points||a.at-b.at).slice(0,5)}
