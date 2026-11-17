import test from 'node:test';
import assert from 'node:assert/strict';
import { readableLightAccent } from './themeAccent.mjs';
const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i+2), 16));
const luminance = channels => channels.map(v => {
  const n=v/255; return n<=.04045 ? n/12.92 : ((n+.055)/1.055)**2.4;
}).reduce((sum,v,i) => sum+v*[.2126,.7152,.0722][i],0);
const contrast = (a,b) => (Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
for(const color of ['#59cf8d','#589eea','#ac7bea','#e77daa','#ed9b61','#e57575','#50c6dd','#e2c75b','#4169ff','#9747ff','#f238c8','#b4ef28','#00ddb5','#ff8126','#ff5368','#ffd329','#ffffff','#00ff00','#ffff00','#ccffff','#123456']) {
  test(`accent ${color} remains readable on white and tinted selections`,()=>{
    const mapped=rgb(readableLightAccent(color));
    assert.ok(contrast(mapped,[255,255,255])>=5.5);
    const selected=mapped.map(v=>v*.12+255*.88);
    assert.ok(contrast(mapped,selected)>=4.5);
  });
}
test('invalid accents use the safe default',()=>{
 assert.equal(readableLightAccent('invalid'),'#247653');
 assert.equal(readableLightAccent(null),'#247653');
});
