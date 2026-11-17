import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ACHIEVEMENT_TEMPLATES } from '../src/lib/achievementTemplates.mjs';
const input='output/rare-achievements-colour-v2-2026-10-26';
const output='public/Image/achievements';
const mappings=[];
for(const a of ACHIEVEMENT_TEMPLATES.filter(a=>a.rarity==='rare')){
 const source=path.join(input,a.id==='18'?'rare-18-v3-hammock.png':`rare-${a.id}-v2.png`);
 const image=`/Image/achievements/rare-${a.id}-v1.webp`;
 const destination=path.join('public',image);
 if(fs.existsSync(destination))throw Error(`File exists: ${destination}`);
 await sharp(source).resize(1254,1254,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:90,alphaQuality:100,effort:6}).toFile(destination);
 const m=await sharp(destination).metadata();
 if(m.width!==1254||m.height!==1254||!m.hasAlpha)throw Error(`Invalid output: ${a.title}`);
 mappings.push({templateId:`v2:${a.id}`,previousImage:a.image,image});
 console.log(`${a.title}: ${Math.round(fs.statSync(destination).size/1024)} KB`);
}
fs.writeFileSync('src/lib/rare-achievement-images.json',JSON.stringify(mappings,null,2)+'\n');
let source=fs.readFileSync('src/lib/achievementTemplates.mjs','utf8');
source=source.split('\n').map(line=>{
 if(!line.includes("rarity: 'rare'"))return line;
 const id=line.match(/id: '(\d+)'/)?.[1];
 const item=mappings.find(m=>m.templateId===`v2:${id}`);
 if(!item)throw Error('Unknown rare template');
 return line.replace(/image: '[^']*'/,`image: '${item.image}'`).replace(/gif: '[^']*'/,"gif: ''");
}).join('\n');
fs.writeFileSync('src/lib/achievementTemplates.mjs',source);
