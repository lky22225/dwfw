// Usage: node scripts/gen_bankcode_spec.js
// Requires: npm i -D puppeteer docx html-docx-js markdown-it

const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType, ImageRun } = require('docx');
const MarkdownIt = require('markdown-it');
const HtmlDocx = require('html-docx-js');

async function loginIfNeeded(page, shotsDir) {
  const loginUrl = process.env.LOGIN_URL || 'http://localhost:3000/login';
  const id = process.env.LOGIN_ID || 'ADMIN';
  const pw = process.env.LOGIN_PW || '1';
  try {
    await page.goto(loginUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 500));
    // username
    const usernameSelectors = [ 'input[name="username"]', 'input[type="text"]' ];
    for (const sel of usernameSelectors) { const el = await page.$(sel); if (el) { await el.click({ clickCount: 3 }); await el.type(id); break; } }
    // password
    const passwordSelectors = [ 'input[name="password"]', 'input[type="password"]' ];
    for (const sel of passwordSelectors) { const el = await page.$(sel); if (el) { await el.click({ clickCount: 3 }); await el.type(pw); break; } }
    // submit
    const clicked = await page.$$eval('button, input[type="submit"]', (nodes)=>{ const t=(n)=> (n.innerText||n.value||''); const btn=nodes.find(n=>t(n).includes('로그인')); if(btn){btn.click(); return true;} return false; });
    if (!clicked) { const submitBtn = await page.$('button[type="submit"], input[type="submit"]'); if (submitBtn) await submitBtn.click(); }
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(()=>{});
    if (shotsDir) { await page.screenshot({ path: path.join(shotsDir, '01_login_filled.png') }); }
  } catch {}
}

async function takeScreenshot(url, outPng) {
  const puppeteer = require('puppeteer');
  const headlessEnv = process.env.HEADLESS || 'true';
  const slowMo = parseInt(process.env.SLOWMO || '0', 10) || 0;
  const browser = await puppeteer.launch({ headless: headlessEnv !== 'false', slowMo, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    const shotsDir = path.resolve(process.cwd(), 'doc', 'steps');
    if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir, { recursive: true });
    await loginIfNeeded(page, shotsDir);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(()=>{});
    await new Promise((r)=>setTimeout(r, 1200));
    await page.waitForSelector('main, #root, body', { timeout: 5000 }).catch(()=>{});
    await page.screenshot({ path: outPng, fullPage: false });
  } finally {
    await browser.close();
  }
}

async function exportPdf(fileUrl, outPdf) {
  const puppeteer = require('puppeteer');
  const headlessEnv = process.env.HEADLESS || 'true';
  const slowMo = parseInt(process.env.SLOWMO || '0', 10) || 0;
  const browser = await puppeteer.launch({ headless: headlessEnv !== 'false', slowMo, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.goto(fileUrl, { waitUntil: 'networkidle2', timeout: 60000 }).catch(()=>{});
    await new Promise((r)=>setTimeout(r, 800));
    await page.pdf({ path: outPdf, format: 'A4', printBackground: true, landscape: false });
  } finally {
    await browser.close();
  }
}

function buildDocx(pngPath, outDocx) {
  const doc = new Document({ creator: 'DwFw', title: '은행코드 등록 화면 명세서', description: 'BankCode UI Spec', sections: [] });
  // Title
  doc.addSection({ children: [ new Paragraph({ text: '은행코드 등록 화면 명세서', heading: HeadingLevel.TITLE }), new Paragraph({ text: `작성일: ${new Date().toISOString().slice(0,10)}` }), new Paragraph({ text: '' }) ]});
  // Screenshot
  const screenshotBuffer = fs.existsSync(pngPath) ? fs.readFileSync(pngPath) : null;
  const imgPara = screenshotBuffer ? new Paragraph({ children: [ new ImageRun({ data: screenshotBuffer, transformation: { width: 640, height: 360 } }) ]}) : new Paragraph({ text: '캡처 이미지가 생성되지 않았습니다.' });
  doc.addSection({ children: [ new Paragraph({ text: '1. 화면구성도 (@Browser screen capture)', heading: HeadingLevel.HEADING_1 }), imgPara ]});
  // Data structure table (brief)
  const table = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    new TableRow({ children: [ new TableCell({ children: [ new Paragraph('필드') ] }), new TableCell({ children: [ new Paragraph('설명') ] }) ] }),
    new TableRow({ children: [ new TableCell({ children: [ new Paragraph('bankCode') ] }), new TableCell({ children: [ new Paragraph('은행코드(3자리)') ] }) ] }),
    new TableRow({ children: [ new TableCell({ children: [ new Paragraph('bankName') ] }), new TableCell({ children: [ new Paragraph('은행명(표준, 수정불가)') ] }) ] }),
    new TableRow({ children: [ new TableCell({ children: [ new Paragraph('effectiveDate') ] }), new TableCell({ children: [ new Paragraph('적용일자 yyyy-MM-dd') ] }) ] }),
    new TableRow({ children: [ new TableCell({ children: [ new Paragraph('remitFee') ] }), new TableCell({ children: [ new Paragraph('송금수수료') ] }) ] }),
    new TableRow({ children: [ new TableCell({ children: [ new Paragraph('sortOrder') ] }), new TableCell({ children: [ new Paragraph('정렬순서') ] }) ] }),
    new TableRow({ children: [ new TableCell({ children: [ new Paragraph('useYn') ] }), new TableCell({ children: [ new Paragraph('사용여부 Y/N') ] }) ] }),
    new TableRow({ children: [ new TableCell({ children: [ new Paragraph('remark') ] }), new TableCell({ children: [ new Paragraph('비고') ] }) ] }),
  ]});
  doc.addSection({ children: [ new Paragraph({ text: '3. 데이터구조도', heading: HeadingLevel.HEADING_1 }), table ] });
  return Packer.toBuffer(doc).then((buffer)=> fs.writeFileSync(outDocx, buffer));
}

function buildMergedHTML(pngPath, mdPath, outHtml) {
  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
  const mdRaw = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : '';
  const mdHtml = md.render(mdRaw);
  const imgTag = fs.existsSync(pngPath) ? `<img src="${pngPath.replace(/\\/g,'/')}" style="max-width:100%;height:auto;border:1px solid #e5e7eb;border-radius:8px"/>` : '<p>(캡처 없음)</p>';
  const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/>
  <title>은행코드 등록 화면 명세서</title>
  <style>body{font-family:Segoe UI,Apple SD Gothic Neo,Malgun Gothic,Arial,sans-serif;line-height:1.7;color:#111;padding:32px}
  h1{font-size:28px;margin:24px 0 12px}h2{font-size:22px;margin:22px 0 10px}h3{font-size:18px;margin:18px 0 8px}
  table{border-collapse:collapse;width:100%}th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}
  img{max-width:100%;height:auto}
  .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0}
  </style></head><body>
  <h1>은행코드 등록 화면 명세서</h1>
  <div class="card"><h2>1. 화면구성도 (@Browser screen capture)</h2>${imgTag}</div>
  <div class="card">${mdHtml}</div>
  </body></html>`;
  fs.writeFileSync(outHtml, html, 'utf8');
}

(async () => {
  const url = process.env.TARGET_URL || 'http://localhost:3000/dashboard/mlm/basic/bank-codes';
  const docDir = path.resolve(process.cwd(), 'doc');
  if (!fs.existsSync(docDir)) fs.mkdirSync(docDir, { recursive: true });
  const pngPath = path.join(docDir, 'bankcode_screen.png');
  const docxPath = path.join(docDir, 'BankCode_명세서.docx');
  const pdfPath = path.join(docDir, 'BankCode_명세서.pdf');
  const htmlPath = path.join(docDir, 'BankCode_명세서.html');
  const mdPath = path.join(docDir, 'BankCode_명세서.md');
  const mergedHtmlPath = path.join(docDir, 'BankCode_명세서_full.html');

  try {
    console.log('Taking screenshot...', url);
    await takeScreenshot(url, pngPath);
  } catch (e) {
    console.warn('Screenshot failed:', e.message);
  }

  console.log('Building DOCX...');
  await buildDocx(pngPath, docxPath);
  console.log('Done:', docxPath);

  try {
    console.log('Building HTML from MD (merge screenshot + markdown)...');
    buildMergedHTML(pngPath, mdPath, mergedHtmlPath);
    console.log('Exporting PDF...');
    await exportPdf('file://' + mergedHtmlPath.replace(/\\/g,'/'), pdfPath);
    console.log('Done:', pdfPath);

    // Replace DOCX with merged HTML content so MD 내용이 그대로 포함됨
    console.log('Exporting merged DOCX ...');
    const mergedHtml = fs.readFileSync(mergedHtmlPath, 'utf8');
    const blob = HtmlDocx.asBlob(mergedHtml);
    const arrBuf = await blob.arrayBuffer();
    fs.writeFileSync(docxPath, Buffer.from(new Uint8Array(arrBuf)));
    console.log('Done:', docxPath);
  } catch (e) {
    console.warn('PDF/DOCX export failed:', e.message);
  }
})();







