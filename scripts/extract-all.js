#!/usr/bin/env node
/* 2-in-1: fix image paths + multi-page scrape */
import puppeteer from 'puppeteer';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'fs';
import {join} from 'path';
import fetch from 'node-fetch';
import {pipeline} from 'stream/promises';
import {createWriteStream} from 'fs';

const base='https://paolomascatelli.com';
const routes=['/','/socialmedia','/photography','/projects','/contact','/faqs'];
const outDir='scripts/export';const imgDir=join(outDir,'images');mkdirSync(imgDir,{recursive:true});

const browser=await puppeteer.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage();
const master={pages:{},images:{},selectors:new Set()};

for(const r of routes){
  const url=base+r;
  await page.goto(url,{waitUntil:'networkidle2'});
  const data=await page.evaluate(()=>{
    const body=document.body.cloneNode(true);
    body.querySelectorAll('script').forEach(s=>s.remove());
    const imgs=[...body.querySelectorAll('img')].map(i=>i.src);
    const sel=new Set([...body.querySelectorAll('*')].map(e=>String(e.className||'')).flatMap(c=>c.split(' ')).filter(Boolean));
    return {html:body.innerHTML,imgs,sel:Array.from(sel)};
  });
  master.pages[r]={html:data.html,imgs:data.imgs};
  data.sel.forEach(s=>master.selectors.add(s));
  // download any new images
  let cnt=existsSync(join(outDir,'img-counter.txt'))?Number(readFileSync(join(outDir,'img-counter.txt'),'utf8')):0;
  for(const u of data.imgs){
    if(u.includes('squarespace-cdn')&&!master.images[u]){
      const extMatch=u.match(/\.(jpg|jpeg|png|gif|webp|svg)/i);const ext=extMatch?extMatch[0]:'.jpg';const file=`img_${cnt++}${ext}`;
      const res=await fetch(u);if(res.ok){await pipeline(res.body,createWriteStream(join(imgDir,file)));master.images[u]=`/assets/images/${file}`;}
    }
  }
  writeFileSync(join(outDir,'img-counter.txt'),String(cnt));
}
await browser.close();

// rewrite HTML in place
Object.keys(master.pages).forEach(r=>{
  let h=master.pages[r].html;
  Object.entries(master.images).forEach(([old,loc])=>{h=h.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'),loc);});
  master.pages[r].html=h;
});

writeFileSync(join(outDir,'multipage.json'),JSON.stringify(master,null,2));

// append missed selectors to extracted-styles.css
const missed=[...master.selectors].filter(c=>c.startsWith('pm-')||c.startsWith('tenebre-'));
const css=missed.map(c=>`.${c}{ /* TODO: re-extract computed */ }`).join('\n');
writeFileSync('api/extracted-styles.css',`\n/* added ${missed.length} selectors */\n${css}\n`,{flag:'a'});

console.log('✓ multipage.json + image map + selector追加 done');
