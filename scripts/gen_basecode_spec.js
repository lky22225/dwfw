// Usage: node scripts/gen_basecode_spec.js
// Requires: npm i -D puppeteer docx

const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ImageRun } = require('docx');
const MarkdownIt = require('markdown-it');
const HtmlDocx = require('html-docx-js');

async function loginIfNeeded(page, shotsDir) {
  const loginUrl = process.env.LOGIN_URL || 'http://localhost:3000/login';
  const id = process.env.LOGIN_ID || 'ADMIN';
  const pw = process.env.LOGIN_PW || '1';
  try {
    await page.goto(loginUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 500));
    // 사용자명 입력
    const usernameSelectors = [
      'input[name="username"]',
      'input[placeholder="사용자명을 입력하세요"]',
      'input[placeholder*="사용자명"]',
      'input[type="text"]'
    ];
    for (const sel of usernameSelectors) {
      const el = await page.$(sel);
      if (el) { await el.click({ clickCount: 3 }); await el.type(id); break; }
    }
    // 비밀번호 입력
    const passwordSelectors = [
      'input[name="password"]',
      'input[placeholder="비밀번호를 입력하세요"]',
      'input[placeholder*="비밀번호"]',
      'input[type="password"]'
    ];
    for (const sel of passwordSelectors) {
      const el = await page.$(sel);
      if (el) { await el.click({ clickCount: 3 }); await el.type(pw); break; }
    }
    // 로그인 버튼 클릭 (텍스트 매칭)
    const clicked = await page.$$eval('button, input[type="submit"]', (nodes) => {
      const target = nodes.find(n => (n.innerText && n.innerText.trim().includes('로그인')) || (n.value && String(n.value).includes('로그인')));
      if (target) { target.click(); return true; }
      return false;
    });
    if (!clicked) {
      const submitBtn = await page.$('button[type="submit"], input[type="submit"]');
      if (submitBtn) await submitBtn.click();
    }
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
    if (shotsDir) {
      await page.screenshot({ path: path.join(shotsDir, '01_login_filled.png') });
    }
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
    // 로그인 세션 확보 시도
    await loginIfNeeded(page, shotsDir);
    await page.screenshot({ path: path.join(shotsDir, '02_after_login.png') });
    // 대시보드로 이동 후 사이드바를 통해 진입
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000/dashboard';
    await page.goto(dashboardUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(shotsDir, '03_dashboard.png') });
    // '기초정보' 클릭
    await page.$$eval('button, a, span, div', (nodes) => {
      const t = (n) => (n.innerText || n.textContent || '').trim();
      const cand = nodes.find(n => t(n).includes('기초정보') && (n.tagName === 'BUTTON' || n.tagName === 'A')) || nodes.find(n => t(n).includes('기초정보'));
      if (cand) cand.click();
    });
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(shotsDir, '04_menu_basic_open.png') });
    // '기초코드등록' 클릭
    await page.$$eval('button, a, span, div', (nodes) => {
      const t = (n) => (n.innerText || n.textContent || '').trim();
      const cand = nodes.find(n => t(n).includes('기초코드등록') && (n.tagName === 'BUTTON' || n.tagName === 'A')) || nodes.find(n => t(n).includes('기초코드등록'));
      if (cand) cand.click();
    });
    // 대상 URL로 이동했는지 최종 보장
    const targetPath = '/dashboard/mlm/basic/base-codes';
    await page.waitForFunction((p) => location.pathname.includes(p), { timeout: 10000 }, targetPath).catch(() => {});
    // 혹시 지정 URL이 다르면 마지막으로 명시 URL 이동
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
    // 약간의 안정화 대기 (Puppeteer v22+: waitForTimeout 제거됨)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // 주요 컨테이너가 렌더될 때까지 최대 5초 대기
    try { await page.waitForSelector('main, #root, body', { timeout: 5000 }); } catch {}
    await page.screenshot({ path: path.join(shotsDir, '05_basecode_screen.png') });
    await page.screenshot({ path: outPng, fullPage: false });
  } finally {
    await browser.close();
  }
}

async function exportPdf(url, outPdf) {
  const puppeteer = require('puppeteer');
  const headlessEnv = process.env.HEADLESS || 'true';
  const slowMo = parseInt(process.env.SLOWMO || '0', 10) || 0;
  const browser = await puppeteer.launch({ headless: headlessEnv !== 'false', slowMo, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    // 로그인 세션 확보 시도
    await loginIfNeeded(page);
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000/dashboard';
    await page.goto(dashboardUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 800));
    await page.$$eval('button, a, span, div', (nodes) => {
      const t = (n) => (n.innerText || n.textContent || '').trim();
      const cand = nodes.find(n => t(n).includes('기초정보') && (n.tagName === 'BUTTON' || n.tagName === 'A')) || nodes.find(n => t(n).includes('기초정보'));
      if (cand) cand.click();
    });
    await new Promise((r) => setTimeout(r, 500));
    await page.$$eval('button, a, span, div', (nodes) => {
      const t = (n) => (n.innerText || n.textContent || '').trim();
      const cand = nodes.find(n => t(n).includes('기초코드등록') && (n.tagName === 'BUTTON' || n.tagName === 'A')) || nodes.find(n => t(n).includes('기초코드등록'));
      if (cand) cand.click();
    });
    const targetPath = '/dashboard/mlm/basic/base-codes';
    await page.waitForFunction((p) => location.pathname.includes(p), { timeout: 10000 }, targetPath).catch(() => {});
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));
    // A4, 배경 포함
    await page.pdf({ path: outPdf, format: 'A4', printBackground: true, landscape: false });
  } finally {
    await browser.close();
  }
}

function buildHtmlSpec(pngPath, outHtml) {
  const title = '기초코드 등록 화면 명세서';
  const date = new Date().toISOString().slice(0,10);
  const imgTag = (fs.existsSync(pngPath)) ? `<img src="${pngPath.replace(/\\/g,'/')}" style="max-width:100%;height:auto;border:1px solid #ddd;border-radius:8px;"/>` : '<p>캡처 이미지가 없습니다.</p>';
  const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><title>${title}</title>
  <style>body{font-family:Segoe UI,Apple SD Gothic Neo,Malgun Gothic,Arial,sans-serif;line-height:1.6;padding:32px;color:#111}
  h1{font-size:28px;margin:0 0 8px}h2{font-size:20px;margin:24px 0 8px}
  .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0}
  table{border-collapse:collapse;width:100%}th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}
  code{background:#f3f4f6;padding:2px 4px;border-radius:4px}
  </style></head><body>
  <h1>${title}</h1><div>작성일: ${date}</div>
  <div class="card"><h2>1. 화면구성도 (@Browser screen capture)</h2>${imgTag}</div>
  <div class="card"><h2>2. 기능 설명</h2>
    <h3>버튼</h3>
    <ul><li>조회: 선택된 코드분류 데이터를 그리드에 조회</li>
    <li>추가: 현재 분류에 새 행 추가(사용여부 Y, 정렬순서=마지막+1)</li>
    <li>삭제: 선택 행 일괄 삭제(확인 팝업)</li>
    <li>저장: 현재 분류 데이터만 병합 저장</li></ul>
    <h3>셀렉트박스</h3><ul><li>ROOT(1~8) 코드 목록 표시, 변경 시 즉시 재조회</li></ul>
    <h3>그리드</h3><ul><li>선택(체크), 코드(최대 20자), 코드명, 정렬순서(0~999, 3자리), 사용여부(Y/N), 비고</li></ul>
  </div>
  <div class="card"><h2>3. 데이터구조도</h2>
    <table><thead><tr><th>필드</th><th>설명</th></tr></thead><tbody>
      <tr><td>codeCategory</td><td>코드분류 (예: 1)</td></tr>
      <tr><td>code</td><td>코드</td></tr>
      <tr><td>codeName</td><td>코드명</td></tr>
      <tr><td>sortOrder</td><td>정렬순서 0~999</td></tr>
      <tr><td>useYn</td><td>사용여부 Y/N</td></tr>
      <tr><td>remark</td><td>비고</td></tr>
    </tbody></table>
  </div>
  <div class="card"><h2>4. UML 다이어그램</h2>
    <pre>BaseCodePage -> API Controller -> BaseCodeService -> JSON Store

User -> UI(저장) -> API(POST) -> Service(병합저장) -> JSON -> 200 OK -> UI 재조회</pre>
  </div>
  </body></html>`;
  fs.writeFileSync(outHtml, html, 'utf8');
}

async function buildDocx(pngPath, outDocx) {
  // 문서 인스턴스 선생성 (이미지 임베드에 필요)
  const doc = new Document({
    creator: 'DwFw',
    title: '기초코드 등록 화면 명세서',
    description: 'BaseCode UI Spec',
    sections: [],
  });

  // 1. 타이틀 섹션
  doc.addSection({
    children: [
      new Paragraph({ text: '기초코드 등록 화면 명세서', heading: HeadingLevel.TITLE }),
      new Paragraph({ text: `작성일: ${new Date().toISOString().slice(0, 10)}` }),
      new Paragraph({ text: '' }),
    ],
  });

  // 2. 화면구성도
  const screenshotBuffer = fs.existsSync(pngPath) ? fs.readFileSync(pngPath) : null;
  let imgPara = new Paragraph({ text: '캡처 이미지가 생성되지 않았습니다.' });
  if (screenshotBuffer) {
    imgPara = new Paragraph({
      children: [
        new ImageRun({
          data: screenshotBuffer,
          transformation: { width: 640, height: 360 },
        }),
      ],
    });
  }
  doc.addSection({
    children: [
      new Paragraph({ text: '1. 화면구성도 (@Browser screen capture)', heading: HeadingLevel.HEADING_1 }),
      imgPara,
    ],
  });

  // 3. 기능 설명
  doc.addSection({
    children: [
      new Paragraph({ text: '2. 기능 설명', heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: '버튼' , heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: '- 조회: 선택된 코드분류 데이터를 그리드에 조회' }),
      new Paragraph({ text: '- 추가: 현재 분류에 새 행 추가(사용여부 Y, 정렬순서=마지막+1)' }),
      new Paragraph({ text: '- 삭제: 선택 행 일괄 삭제(확인 팝업)' }),
      new Paragraph({ text: '- 저장: 현재 분류 데이터만 병합 저장' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '셀렉트박스', heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: '- ROOT(1~8) 코드 목록 표시, 변경 시 즉시 재조회' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '그리드', heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: '- 선택(체크), 코드(최대 20자), 코드명, 정렬순서(0~999, 3자리), 사용여부(Y/N), 비고' }),
    ],
  });

  // 4. 데이터구조도
  const codeTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [ new TableCell({ children: [ new Paragraph('필드') ] }), new TableCell({ children: [ new Paragraph('설명') ] }) ] }),
      new TableRow({ children: [ new TableCell({ children: [ new Paragraph('codeCategory') ] }), new TableCell({ children: [ new Paragraph('코드분류 (예: 1)') ] }) ] }),
      new TableRow({ children: [ new TableCell({ children: [ new Paragraph('code') ] }), new TableCell({ children: [ new Paragraph('코드') ] }) ] }),
      new TableRow({ children: [ new TableCell({ children: [ new Paragraph('codeName') ] }), new TableCell({ children: [ new Paragraph('코드명') ] }) ] }),
      new TableRow({ children: [ new TableCell({ children: [ new Paragraph('sortOrder') ] }), new TableCell({ children: [ new Paragraph('정렬순서 0~999') ] }) ] }),
      new TableRow({ children: [ new TableCell({ children: [ new Paragraph('useYn') ] }), new TableCell({ children: [ new Paragraph('사용여부 Y/N') ] }) ] }),
      new TableRow({ children: [ new TableCell({ children: [ new Paragraph('remark') ] }), new TableCell({ children: [ new Paragraph('비고') ] }) ] }),
    ],
  });
  doc.addSection({ children: [ new Paragraph({ text: '3. 데이터구조도', heading: HeadingLevel.HEADING_1 }), codeTable ] });

  // 5. UML
  doc.addSection({
    children: [
      new Paragraph({ text: '4. UML 다이어그램', heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: '[클래스 개요]' }),
      new Paragraph({ text: 'BaseCodePage -> API Controller -> BaseCodeService -> JSON Store' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '[저장 시퀀스]' }),
      new Paragraph({ text: 'User -> UI(저장) -> API(POST) -> Service(병합저장) -> JSON -> 200 OK -> UI 재조회' }),
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outDocx, buffer);
}

function buildMergedHTML(pngPath, mdPath, outHtml) {
  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
  const mdRaw = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : '';
  const mdHtml = md.render(mdRaw);
  const imgTag = fs.existsSync(pngPath)
    ? `<img src="${pngPath.replace(/\\/g,'/')}" style="max-width:100%;height:auto;border:1px solid #e5e7eb;border-radius:8px"/>`
    : '<p>(캡처 없음)</p>';
  const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/>
  <title>기초코드 등록 화면 명세서</title>
  <style>body{font-family:Segoe UI,Apple SD Gothic Neo,Malgun Gothic,Arial,sans-serif;line-height:1.7;color:#111;padding:32px}
  h1{font-size:28px;margin:24px 0 12px}h2{font-size:22px;margin:22px 0 10px}h3{font-size:18px;margin:18px 0 8px}
  table{border-collapse:collapse;width:100%}th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}
  img{max-width:100%;height:auto}
  .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0}
  </style></head><body>
  <h1>기초코드 등록 화면 명세서</h1>
  <div class="card"><h2>1. 화면구성도 (@Browser screen capture)</h2>${imgTag}</div>
  <div class="card">${mdHtml}</div>
  </body></html>`;
  fs.writeFileSync(outHtml, html, 'utf8');
}

(async () => {
  const url = process.env.TARGET_URL || 'http://localhost:3000/dashboard/mlm/basic/base-codes';
  const docDir = path.resolve(process.cwd(), 'doc');
  if (!fs.existsSync(docDir)) fs.mkdirSync(docDir, { recursive: true });
  const pngPath = path.join(docDir, 'basecode_screen.png');
  const docxPath = path.join(docDir, 'BaseCode_명세서.docx');
  const pdfPath = path.join(docDir, 'BaseCode_명세서.pdf');
  const htmlPath = path.join(docDir, 'BaseCode_명세서.html');
  const mdPath = path.join(docDir, 'BaseCode_명세서.md');
  const mergedHtmlPath = path.join(docDir, 'BaseCode_명세서_full.html');

  try {
    console.log('Taking screenshot...', url);
    await takeScreenshot(url, pngPath);
  } catch (e) {
    console.warn('Screenshot failed:', e.message);
  }

  console.log('Building docx...');
  await buildDocx(pngPath, docxPath);
  console.log('Done:', docxPath);

  try {
    console.log('Building HTML from MD (merge screenshot + markdown)...');
    buildMergedHTML(pngPath, mdPath, mergedHtmlPath);
    console.log('Exporting PDF...');
    await exportPdf('file://' + mergedHtmlPath.replace(/\\/g,'/'), pdfPath);
    console.log('Done:', pdfPath);

    // Also produce a DOCX from merged HTML to fully include MD sections
    console.log('Exporting DOCX (merged) ...');
    const mergedHtml = fs.readFileSync(mergedHtmlPath, 'utf8');
    const blob = HtmlDocx.asBlob(mergedHtml);
    const arrBuf = await blob.arrayBuffer();
    fs.writeFileSync(docxPath, Buffer.from(new Uint8Array(arrBuf)));
    console.log('Done:', docxPath);
  } catch (e) {
    console.warn('PDF export failed:', e.message);
  }
})();


