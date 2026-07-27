// Usage:
//  1) npm i -D markdown-it puppeteer html-docx-js
//  2) node scripts/md_to_docs.js doc/BaseCode_명세서.md

const fs = require('fs');
const path = require('path');

async function ensurePkgs() {
  try {
    require.resolve('markdown-it');
    require.resolve('puppeteer');
    require.resolve('html-docx-js');
  } catch (e) {
    console.error('\n[ERROR] 필요한 패키지가 설치되지 않았습니다.');
    console.error('다음 명령을 실행하세요:');
    console.error('  npm i -D markdown-it puppeteer html-docx-js');
    process.exit(1);
  }
}

async function mdToHtml(mdPath, outHtmlPath) {
  const md = require('markdown-it')({ html: true, linkify: true, typographer: true });
  const raw = fs.readFileSync(mdPath, 'utf8');
  const body = md.render(raw);
  const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8" />
  <title>${path.basename(mdPath)}</title>
  <style>
  body{font-family:Segoe UI,Apple SD Gothic Neo,Malgun Gothic,Arial,sans-serif;line-height:1.7;color:#111;padding:32px}
  h1{font-size:28px;margin:24px 0 12px}h2{font-size:22px;margin:22px 0 10px}h3{font-size:18px;margin:18px 0 8px}
  code, pre{background:#f6f8fa;border-radius:6px} pre{padding:12px;overflow:auto}
  table{border-collapse:collapse;width:100%;margin:12px 0}th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}
  img{max-width:100%;height:auto}
  </style></head><body>${body}</body></html>`;
  fs.writeFileSync(outHtmlPath, html, 'utf8');
}

async function htmlToPdf(htmlPath, outPdfPath) {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.goto('file://' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle2', timeout: 60000 });
    await page.pdf({ path: outPdfPath, format: 'A4', printBackground: true });
  } finally {
    await browser.close();
  }
}

async function htmlToDocx(htmlPath, outDocxPath) {
  const HtmlDocx = require('html-docx-js');
  const html = fs.readFileSync(htmlPath, 'utf8');
  // asBlob() returns a Blob in recent versions; convert to Buffer
  const blob = HtmlDocx.asBlob(html);
  const arrBuf = await blob.arrayBuffer();
  const nodeBuf = Buffer.from(new Uint8Array(arrBuf));
  fs.writeFileSync(outDocxPath, nodeBuf);
}

(async () => {
  await ensurePkgs();
  const inputArg = process.argv[2] || path.join('doc', 'BaseCode_명세서.md');
  const mdPath = path.resolve(process.cwd(), inputArg);
  if (!fs.existsSync(mdPath)) {
    console.error('[ERROR] MD 파일을 찾을 수 없습니다:', mdPath);
    process.exit(1);
  }

  const outDir = path.dirname(mdPath);
  const baseName = path.basename(mdPath, path.extname(mdPath));
  const htmlPath = path.resolve(outDir, baseName + '.html');
  const pdfPath = path.resolve(outDir, baseName + '.pdf');
  const docxPath = path.resolve(outDir, baseName + '.docx');

  console.log('> Markdown → HTML');
  await mdToHtml(mdPath, htmlPath);
  console.log('  ', htmlPath);

  console.log('> HTML → PDF');
  await htmlToPdf(htmlPath, pdfPath);
  console.log('  ', pdfPath);

  console.log('> HTML → DOCX');
  await htmlToDocx(htmlPath, docxPath);
  console.log('  ', docxPath);

  console.log('완료.');
})();


