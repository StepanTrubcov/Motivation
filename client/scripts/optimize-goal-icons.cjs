const fs = require('node:fs');
const sharp = require('sharp');
const names = ['run','walk','exercise','breathing','computer','clock','clean','book','idea','prayer','singing','star','no-sweets','custom'];
const labels = ['Бег','Ходьба','Упражнения','Дыхание','Ноутбук','Часы','Уборка','Книга','Идея','Молитва','Пение','Звёздочка','Без сладостей','Своя цель'];
(async () => {
    let bytes = 0;
    const tiles = [];
    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const source = `output/goal-icons/${name}-source.png`;
        const meta = await sharp(source).metadata();
        if (!meta.hasAlpha) throw new Error(`Missing transparency: ${name}`);
        const dest = `public/Image/goals-v1/${name}.webp`;
        await sharp(source).resize(128,128,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:90,alphaQuality:100}).toFile(dest);
        bytes += fs.statSync(dest).size;
        const label = Buffer.from(`<svg width="160" height="22"><text x="12" y="16" fill="white" font-size="13">${labels[i]}</text></svg>`);
        tiles.push({input:label,left:(i%4)*160,top:Math.floor(i/4)*160});
        tiles.push({input:await sharp(dest).resize(100,100).png().toBuffer(),left:(i%4)*160+30,top:Math.floor(i/4)*160+35});
    }
    await sharp({create:{width:640,height:640,channels:4,background:'#202529'}}).composite(tiles).png().toFile('output/goal-icons/preview.png');
    console.log(JSON.stringify({icons:names.length,totalBytes:bytes}));
})().catch(error=>{console.error(error.message);process.exitCode=1});
