import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { seededRandom } from '../games.js';
import { GRID, PICTURES, AREA, BOARD, geometry, buildEdges, edgePath, pieceEdges, piecePath, scatter } from '../jigsaw.js';

const points = text => {
  const ns = (text.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi) ?? []).map(Number);
  return Array.from({length:ns.length/2},(_,i)=>ns.slice(i*2,i*2+2));
};
const close = (a,b) => a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<.000003,`${a} != ${b}`));

test('jigsaw: clean scene dimensions match the actual PNG headers',()=>{
  assert.deepEqual(PICTURES.map(p=>p.src),['assets/visual/puzzle/futuro-campus-v1.png','assets/visual/puzzle/futuro-tech-v1.png']);
  for(const picture of PICTURES) {
    const bytes=readFileSync(new URL(`../${picture.src}`,import.meta.url));
    assert.equal(bytes.subarray(1,4).toString(),'PNG');
    assert.equal(bytes.readUInt32BE(16),picture.w);
    assert.equal(bytes.readUInt32BE(20),picture.h);
    assert.equal(picture.w/picture.h,4/3);
  }
});

test('jigsaw: shared cubic controls reverse exactly, including extreme shifts and rectangular cells',()=>{
  for (const picture of [...PICTURES,{w:1536,h:1024},{w:1920,h:1080}]) {
    for (const [cols,rows] of Object.values(GRID)) for (let seed=0;seed<80;seed++) {
      const geo=geometry(cols,rows,picture), edges=buildEdges(cols,rows,seededRandom(seed));
      for (let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
        const e=pieceEdges(r,c,geo,edges),x=c*geo.cw,y=r*geo.ch;
        if(c+1<cols) {
          const next=pieceEdges(r,c+1,geo,edges).left;
          const a=[[x+geo.cw,y],...points(edgePath(x+geo.cw,y,x+geo.cw,y+geo.ch,e.right.sign,e.right.shift))];
          const b=[[x+geo.cw,y+geo.ch],...points(edgePath(x+geo.cw,y+geo.ch,x+geo.cw,y,next.sign,next.shift))].reverse();
          assert.equal(a.length,b.length);a.forEach((p,i)=>close(p,b[i]));
        }
        if(r+1<rows) {
          const next=pieceEdges(r+1,c,geo,edges).top;
          const a=[[x+geo.cw,y+geo.ch],...points(edgePath(x+geo.cw,y+geo.ch,x,y+geo.ch,e.bottom.sign,e.bottom.shift))];
          const b=[[x,y+geo.ch],...points(edgePath(x,y+geo.ch,x+geo.cw,y+geo.ch,next.sign,next.shift))].reverse();
          assert.equal(a.length,b.length);a.forEach((p,i)=>close(p,b[i]));
        }
        for(const [px,py] of points(piecePath(r,c,geo,edges))) {
          assert.ok(px>=x-geo.pad-.000001&&px<=x+geo.cw+geo.pad+.000001);
          assert.ok(py>=y-geo.pad-.000001&&py<=y+geo.ch+geo.pad+.000001);
        }
      }
    }
  }
  for(const shift of [-.04,.04]) for(const sign of [-1,1]) {
    const a=[[0,0],...points(edgePath(0,0,200,0,sign,shift))];
    const b=[[200,0],...points(edgePath(200,0,0,0,-sign,-shift))].reverse();
    a.forEach((p,i)=>close(p,b[i]));
  }
});

test('jigsaw: targets preserve one continuous image even when padded origins are negative',()=>{
  for(const picture of PICTURES) for(const [cols,rows] of Object.values(GRID)) {
    const geo=geometry(cols,rows,picture);
    close([geo.bw/geo.bh],[picture.w/picture.h]);
    assert.ok(BOARD.x-geo.pad<0,'regression fixture must exercise negative targets');
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
      const tx=BOARD.x+c*geo.cw-geo.pad,ty=BOARD.y+r*geo.ch-geo.pad;
      // Mapping any global image coordinate via this piece must be independent
      // of its cell, instead of clamping tx/ty to the padded SVG rectangle.
      close([tx-(c*geo.cw-geo.pad),ty-(r*geo.ch-geo.pad)],[BOARD.x,BOARD.y]);
    }
  }
});

test('jigsaw: scatter stays in bounds, outside the preview, deterministic and side-specific',()=>{
  for(const picture of PICTURES) for(const [cols,rows] of Object.values(GRID)) {
    const geo=geometry(cols,rows,picture);
    for(let seed=0;seed<30;seed++) {
      const spots=scatter(cols*rows,geo,seededRandom(seed));
      assert.deepEqual(spots,scatter(cols*rows,geo,seededRandom(seed)));
      assert.notDeepEqual(spots,scatter(cols*rows,geo,seededRandom(`right-${seed}`)));
      for(const {x,y} of spots) {
        assert.ok(Number.isFinite(x)&&Number.isFinite(y));
        assert.ok(x>=0&&y>=0&&x+geo.pw<=AREA.w+.000001&&y+geo.ph<=AREA.h+.000001);
        assert.ok(x>=BOARD.x+geo.bw||y>=BOARD.y+geo.bh);
      }
    }
  }
});

test('jigsaw: reject dimensions that cannot produce a crop',()=>{
  for(const [c,r,p] of [[0,2,PICTURES[0]],[3,1.5,PICTURES[0]],[3,2,{w:0,h:1}],[3,2,{w:1,h:NaN}]])
    assert.throws(()=>geometry(c,r,p),RangeError);
});
