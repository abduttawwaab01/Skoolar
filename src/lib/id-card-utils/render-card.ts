import QRCode from 'qrcode';
import sharp from 'sharp';
import { db } from '@/lib/db';

const MM_PX = (mm: number) => Math.round((mm / 25.4) * 300);

// Portrait = taller (53.98×85.6mm / 637×1011px)
// Landscape = wider (85.6×53.98mm / 1011×637px)
const PW = MM_PX(53.98), PH = MM_PX(85.6);
const LW = MM_PX(85.6), LH = MM_PX(53.98);

function esc(s: unknown): string {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function px(v: number): string { return Math.round(v) + ''; }

function adjustColor(c: string, amt: number): string {
  const h = c.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(h.substr(0, 2), 16) + amt));
  const g = Math.max(0, Math.min(255, parseInt(h.substr(2, 2), 16) + amt));
  const b = Math.max(0, Math.min(255, parseInt(h.substr(4, 2), 16) + amt));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export async function renderIDCard(
  person: any,
  colors: { primary: string; secondary: string },
  backText: string,
  showPhoto: boolean,
  showBarcode: boolean,
  showQR: boolean,
  orientation: string,
  photoUrl: string | null,
  role: string,
  isBack = false
): Promise<Buffer> {
  const port = orientation === 'portrait';
  const W = port ? PW : LW;
  const H = port ? PH : LH;

  const personType = person.type || (role === 'STUDENT' ? 'student' : 'staff');
  const prim = colors.primary || '#059669';
  const sec = colors.secondary || '#FFFFFF';

  // ── QR code ─────────────────────────────────────────────
  let qrBase64 = '';
  if (showQR && !isBack) {
    try {
      const qrBuf = await QRCode.toBuffer(JSON.stringify({
        type: personType,
        id: esc(person.displayId || person.admissionNo || person.employeeNo || 'N/A'),
        userId: person.userId || '',
        personId: person.id || person.personId || '',
        schoolId: person.schoolId || '',
        name: esc(person.name || ''),
        role,
        timestamp: Date.now(),
      }), { width: port ? 180 : 200, margin: 1, color: { dark: prim, light: sec } });
      qrBase64 = qrBuf.toString('base64');
    } catch (_) {}
  }

  // ── School info ──────────────────────────────────────────
  let sn = 'School', sa = '', sp = '';
  if (person.schoolId) {
    try {
      const s = await db.school.findUnique({ where: { id: person.schoolId }, select: { name: true, address: true, phone: true, email: true } });
      if (s) { sn = s.name || 'School'; sa = s.address || ''; sp = s.phone || s.email || ''; }
    } catch (_) {}
  }

  // ── Dynamic values ───────────────────────────────────────
  const pName = esc(person.name || 'Unknown');
  const pId = esc(person.displayId || 'N/A');
  const pClass = esc(person.class || 'N/A');
  const pGender = esc(person.gender || 'N/A');
  const pPhone = esc(person.phone || '');
  const pmE = esc(personType === 'student' ? 'Class: ' + pClass : '');
  const pmV = esc(personType === 'student' ? 'ID: ' + pId : 'ID: ' + pId);
  const pRl = esc(role);
  const sName = esc(sn.substring(0, port ? 20 : 28));
  const sAddr = esc(sa);
  const sPh = esc(sp);
  const initials = esc((person.name || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'NA');
  const bText = esc(backText);

  // ── Photo ────────────────────────────────────────────────
  let photoEl = '';
  if (showPhoto) {
    let b64 = '', mime = 'image/jpeg';
    if (photoUrl) {
      try {
        const url = photoUrl.startsWith('/') ? photoUrl : photoUrl.startsWith('http') ? photoUrl : `https://skoolar.org${photoUrl}`;
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 4000);
        const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'Skoolar-ID/1.0' } });
        clearTimeout(tid);
        if (r.ok) {
          const ct = r.headers.get('content-type') || '';
          if (ct.startsWith('image/')) {
            const ab = await r.arrayBuffer();
            b64 = Buffer.from(new Uint8Array(ab)).toString('base64');
            mime = ct;
          }
        }
      } catch (_) {}
    }
    if (b64 && b64.length > 100) {
      const ps = port ? Math.round(W * 0.19) : Math.round(W * 0.13);
      const px_ = Math.round(W * 0.035);
      const py = Math.round(H * 0.13);
      const ph = Math.round(ps * 1.25);
      const r4 = Math.round(ps * 0.06);
      photoEl = `<rect x="${px(px_)}" y="${px(py)}" width="${px(ps)}" height="${px(ph)}" rx="${px(r4)}" fill="${prim}" opacity="0.07"/>
<svg x="${px(px_ + 2)}" y="${px(py + 2)}" width="${px(ps - 4)}" height="${px(ph - 4)}" viewBox="0 0 ${ps - 4} ${ph - 4}" preserveAspectRatio="xMidYMid slice"><clipPath id="pc"><rect width="${ps - 4}" height="${ph - 4}" rx="${px(r4 - 1)}"/></clipPath></svg>
<image x="${px(px_ + 2)}" y="${px(py + 2)}" width="${px(ps - 4)}" height="${px(ph - 4)}" href="data:${mime};base64,${b64}" preserveAspectRatio="xMidYMid slice" clip-path="url(#pc)"/>`;
    } else {
      const ps = port ? Math.round(W * 0.19) : Math.round(W * 0.13);
      const px_ = Math.round(W * 0.035);
      const py = Math.round(H * 0.13);
      const ph = Math.round(ps * 1.25);
      photoEl = `<rect x="${px(px_)}" y="${px(py)}" width="${px(ps)}" height="${px(ph)}" rx="${px(Math.round(ps * 0.07))}" fill="${prim}" opacity="0.06"/>
<rect x="${px(px_ + 2)}" y="${px(py + 2)}" width="${px(ps - 4)}" height="${px(ph - 4)}" rx="${px(Math.round(ps * 0.06))}" fill="none" stroke="${prim}" stroke-width="2" opacity="0.35"/>
<circle cx="${px(px_ + ps / 2)}" cy="${px(py + ph * 0.42)}" r="${px(Math.round(ps * 0.3))}" fill="${prim}" opacity="0.12"/>
<text x="${px(px_ + ps / 2)}" y="${px(py + ph * 0.42 + Math.round(ps * 0.12))}" font-family="sans-serif" font-size="${px(Math.round(ps * 0.35))}" font-weight="bold" fill="${prim}" text-anchor="middle">${initials}</text>
<text x="${px(px_ + ps / 2)}" y="${px(py + ph * 0.88)}" font-family="sans-serif" font-size="${px(Math.round(ps * 0.1))}" fill="#666" text-anchor="middle">PHOTO</text>`;
    }
  }

  // ── Layout calculations ──────────────────────────────────
  const hdrH = Math.round(H * 0.07);
  const hdrFs = Math.round(H * 0.024);
  const hdrSubFs = Math.round(H * 0.015);
  const photoW = port ? Math.round(W * 0.19) : Math.round(W * 0.13);
  const photoX = Math.round(W * 0.035);
  const photoY = Math.round(H * 0.13);
  const photoH = Math.round(photoW * 1.25);
  const txtX = Math.round(photoX + photoW + W * 0.03);
  const nameY = Math.round(photoY + photoH * 0.28);
  const nameFs = Math.round(H * 0.025);
  const badgeY = Math.round(photoY + photoH * 0.4);
  const badgeH = Math.round(H * 0.022);
  const badgeFs = Math.round(H * 0.013);
  const idY = Math.round(photoY + photoH * 0.54);
  const detailFs = Math.round(H * 0.013);
  const lh = Math.round(H * 0.025);
  const wmFs = Math.round(H * 0.009);

  // QR dimensions
  let qrSz = 0, qrX = 0, qrY = 0;
  if (showQR && qrBase64) {
    qrSz = port ? Math.round(H * 0.24) : Math.round(W * 0.22);
    qrX = Math.round(W - qrSz - W * 0.035);
    qrY = Math.round(H - qrSz - H * 0.055);
  }

  // Info lines after ID
  const infoLines: { lab: string; val: string }[] = [];
  if (personType === 'student') {
    infoLines.push({ lab: 'Class', val: pClass });
    infoLines.push({ lab: 'Gender', val: pGender });
  } else {
    if (pRl) infoLines.push({ lab: 'Role', val: pRl });
    if (pPhone) infoLines.push({ lab: 'Phone', val: pPhone });
  }

  // Barcode fallback
  let bcEl = '';
  if (showBarcode && !showQR) {
    const bcX = txtX;
    const bcY = Math.round(idY + lh * 3 + H * 0.015);
    bcEl = Array.from({ length: 40 }).map((_, i) =>
      `<rect x="${px(bcX + i * 2)}" y="${px(bcY + 4)}" width="${i % 2 === 0 ? 1.5 : 1}" height="${px(Math.round(H * 0.04))}" fill="#333"/>`
    ).join('');
  }

  // ── Back card text lines ─────────────────────────────────
  const backLines = isBack && bText ? bText.split('\n') : [];

  // ── SVG build ────────────────────────────────────────────
  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="hd" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="${prim}" stop-opacity="1"/>
    <stop offset="100%" stop-color="${adjustColor(prim, -25)}" stop-opacity="1"/>
  </linearGradient>
  <linearGradient id="ac" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="${adjustColor(prim, 20)}" stop-opacity="0.07"/>
    <stop offset="100%" stop-color="${sec}" stop-opacity="0"/>
  </linearGradient>
</defs>

<rect width="100%" height="100%" fill="${sec}"/>
<rect width="100%" height="100%" fill="url(#ac)"/>

<!-- Header bar -->
<rect x="0" y="0" width="100%" height="${px(hdrH)}" fill="url(#hd)"/>
<text x="${px(Math.round(W * 0.04))}" y="${px(Math.round(hdrH * 0.62))}" font-family="sans-serif" font-size="${px(hdrFs)}" font-weight="bold" fill="#fff">${sName}</text>
<text x="${px(W - Math.round(W * 0.04))}" y="${px(Math.round(hdrH * 0.62))}" font-family="sans-serif" font-size="${px(hdrSubFs)}" fill="rgba(255,255,255,0.8)" text-anchor="end">ID CARD</text>

${isBack ? `
<!-- Back card content -->
<text x="50%" y="${px(Math.round(H * 0.28))}" font-family="sans-serif" font-size="${px(Math.round(H * 0.02))}" font-weight="bold" fill="${prim}" text-anchor="middle">BACK SIDE</text>
${backLines.map((line, i) => {
  const isEmpty = !line.trim();
  const isBold = !isEmpty && /^[A-Z\s]+:/.test(line.trim());
  const fs = isEmpty ? Math.round(H * 0.01) : isBold ? Math.round(H * 0.016) : Math.round(H * 0.014);
  const y = Math.round(H * 0.33 + i * (isEmpty ? 0.01 : 0.026) * H);
  const fw = isBold ? 'bold' : 'normal';
  return isEmpty
    ? `<rect x="${px(Math.round(W * 0.1))}" y="${px(y)}" width="${px(Math.round(W * 0.8))}" height="${px(Math.round(H * 0.005))}" fill="#eee"/>`
    : `<text x="50%" y="${px(y)}" font-family="sans-serif" font-size="${px(fs)}" font-weight="${fw}" fill="#444" text-anchor="middle">${esc(line)}</text>`;
}).join('\n')}
` : `
<!-- Photo area -->
${photoEl}

<!-- Name -->
<text x="${px(txtX)}" y="${px(nameY)}" font-family="sans-serif" font-size="${px(nameFs)}" font-weight="bold" fill="${prim}">${pName}</text>

<!-- Role badge -->
${role ? `<rect x="${px(txtX)}" y="${px(badgeY)}" width="${px(Math.round(W * 0.14))}" height="${px(badgeH)}" rx="${px(Math.round(badgeH / 2))}" fill="none" stroke="${prim}" stroke-width="1.2"/>
<text x="${px(txtX + Math.round(W * 0.07))}" y="${px(badgeY + Math.round(badgeH * 0.72))}" font-family="sans-serif" font-size="${px(badgeFs)}" font-weight="bold" fill="${prim}" text-anchor="middle">${pRl}</text>` : ''}

<!-- ID -->
<text x="${px(txtX)}" y="${px(idY)}" font-family="sans-serif" font-size="${px(detailFs)}" fill="#444">ID <tspan font-weight="bold">${pId}</tspan></text>

${infoLines.map((l, i) =>
  `<text x="${px(txtX)}" y="${px(Math.round(idY + (i + 1) * lh))}" font-family="sans-serif" font-size="${px(detailFs)}" fill="#444">${esc(l.lab)}: <tspan font-weight="bold">${l.val}</tspan></text>`
).join('')}

<!-- QR code -->
${showQR && qrBase64 ? `<rect x="${px(qrX)}" y="${px(qrY)}" width="${px(qrSz)}" height="${px(qrSz)}" rx="${px(Math.round(qrSz * 0.07))}" fill="#fff" stroke="${prim}" stroke-width="3"/>
<rect x="${px(qrX + Math.round(qrSz * 0.06))}" y="${px(qrY + Math.round(qrSz * 0.06))}" width="${px(Math.round(qrSz * 0.88))}" height="${px(Math.round(qrSz * 0.88))}" rx="${px(Math.round(qrSz * 0.04))}" fill="${sec}"/>
<image x="${px(qrX + Math.round(qrSz * 0.12))}" y="${px(qrY + Math.round(qrSz * 0.12))}" width="${px(Math.round(qrSz * 0.76))}" height="${px(Math.round(qrSz * 0.76))}" href="data:image/png;base64,${qrBase64}"/>
<text x="${px(qrX + qrSz / 2)}" y="${px(qrY + qrSz + Math.round(H * 0.018))}" font-family="sans-serif" font-size="${px(Math.round(qrSz * 0.1))}" font-weight="bold" fill="#333" text-anchor="middle">SCAN ME</text>` : ''}

<!-- Barcode -->
${bcEl}
`}

<!-- Footer -->
<rect x="0" y="${px(H - Math.round(H * 0.028))}" width="100%" height="${px(Math.round(H * 0.028))}" fill="${prim}" opacity="0.06"/>
<text x="50%" y="${px(H - Math.round(H * 0.01))}" font-family="sans-serif" font-size="${px(wmFs)}" fill="#999" text-anchor="middle">Skoolar - Odebunmi Tawwāb</text>
</svg>`;

  return sharp(Buffer.from(svg)).png({ quality: 100 }).toBuffer();
}
