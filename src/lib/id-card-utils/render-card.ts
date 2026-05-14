import QRCode from 'qrcode';
import sharp from 'sharp';
import { db } from '@/lib/db';

// Standard ID card dimensions at 300 DPI
// Portrait (taller than wide): 53.98mm × 85.6mm
// Landscape (wider than tall): 85.6mm × 53.98mm
const CARD_W_MM = 85.6;
const CARD_H_MM = 53.98;
const DPI = 300;
const MM_TO_IN = 25.4;

function mmToPx(mm: number): number {
  return Math.round((mm / MM_TO_IN) * DPI);
}

const CARD_W_PX_PORTRAIT = mmToPx(CARD_H_MM);  // 637
const CARD_H_PX_PORTRAIT = mmToPx(CARD_W_MM);   // 1011
const CARD_W_PX_LANDSCAPE = mmToPx(CARD_W_MM);   // 1011
const CARD_H_PX_LANDSCAPE = mmToPx(CARD_H_MM);   // 637

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
  const isPortrait = orientation === 'portrait';
  const W = isPortrait ? CARD_W_PX_PORTRAIT : CARD_W_PX_LANDSCAPE;
  const H = isPortrait ? CARD_H_PX_PORTRAIT : CARD_H_PX_LANDSCAPE;

  const personType = person.type || (role === 'STUDENT' ? 'student' : 'staff');

  // Generate QR code as base64 PNG
  let qrBase64 = '';
  if (showQR && !isBack) {
    const qrData = JSON.stringify({
      type: personType,
      id: person.displayId || person.admissionNo || person.employeeNo || 'N/A',
      userId: person.userId,
      personId: person.id || person.personId,
      schoolId: person.schoolId,
      name: person.name,
      role: role,
      timestamp: Date.now(),
    });
    try {
      const qrSize = isPortrait ? 180 : 200;
      const qrBuffer = await QRCode.toBuffer(qrData, {
        width: qrSize,
        margin: 1,
        color: { dark: colors.primary, light: colors.secondary },
      });
      qrBase64 = qrBuffer.toString('base64');
    } catch (err) {
      console.error('QR generation failed:', err);
    }
  }

  // Fetch school info
  let schoolName = 'School';
  let schoolAddress = 'Address';
  let schoolPhone = 'Phone';
  if (person.schoolId) {
    const school = await db.school.findUnique({
      where: { id: person.schoolId },
      select: { name: true, address: true, phone: true, email: true },
    });
    if (school) {
      schoolName = school.name || 'School';
      schoolAddress = school.address || 'Address';
      schoolPhone = school.phone || school.email || 'Phone';
    }
  }

  const initials = person.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'NA';
  const displayId = person.displayId || 'N/A';
  const className = person.class || 'N/A';
  const gender = person.gender || 'N/A';
  const phone = person.phone || '';

  // ─── BACK SIDE ────────────────────────────────────────────
  if (isBack) {
    const hdrH = Math.round(H * 0.07);
    const fsTitle = Math.round(H * 0.022);
    const fsContact = Math.round(H * 0.013);
    const fsBack = Math.round(H * 0.012);
    const fsFooter = Math.round(H * 0.011);
    const fsWm = Math.round(H * 0.009);

    const backSVG = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bHdr" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${colors.primary}" stop-opacity="1" />
            <stop offset="100%" stop-color="${adjustColor(colors.primary, -15)}" stop-opacity="1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="${colors.secondary}"/>
        <rect x="0" y="0" width="100%" height="${hdrH}" fill="url(#bHdr)"/>
        <text x="50%" y="${Math.round(hdrH * 0.62)}" font-family="Arial,sans-serif" font-size="${fsTitle}" font-weight="bold" fill="white" text-anchor="middle">${schoolName}</text>
        <text x="${Math.round(W * 0.04)}" y="${Math.round(hdrH * 1.7)}" font-family="Arial,sans-serif" font-size="${fsContact}" fill="#444">${schoolAddress} | ${schoolPhone}</text>
        <line x1="${Math.round(W * 0.03)}" y1="${Math.round(hdrH * 2.1)}" x2="${W - Math.round(W * 0.03)}" y2="${Math.round(hdrH * 2.1)}" stroke="${colors.primary}" stroke-width="1" opacity="0.3"/>
        <text x="${Math.round(W * 0.04)}" y="${Math.round(H * 0.24)}" font-family="Arial,sans-serif" font-size="${fsBack}" fill="#555">${backText.replace(/\n/g, '&#xa;')}</text>
        <line x1="${Math.round(W * 0.03)}" y1="${H - Math.round(H * 0.08)}" x2="${W - Math.round(W * 0.03)}" y2="${H - Math.round(H * 0.08)}" stroke="${colors.primary}" stroke-width="1" opacity="0.3"/>
        <text x="50%" y="${H - Math.round(H * 0.055)}" font-family="Arial,sans-serif" font-size="${fsFooter}" fill="#888" text-anchor="middle">Academic Year: ${new Date().getFullYear()}/${new Date().getFullYear() + 1}</text>
        <text x="50%" y="${H - Math.round(H * 0.035)}" font-family="Arial,sans-serif" font-size="${fsFooter}" fill="#aaa" text-anchor="middle">Emergency Contact: ${schoolPhone}</text>
        <text x="${W - Math.round(W * 0.03)}" y="${H - Math.round(H * 0.015)}" font-family="Arial,sans-serif" font-size="${fsWm}" fill="#ccc" text-anchor="end">Skoolar - Odebunmi Tawwāb</text>
      </svg>`;
    return sharp(Buffer.from(backSVG)).png().toBuffer();
  }

  // ─── FRONT SIDE ───────────────────────────────────────────
  const phSz = Math.round(W * (isPortrait ? 0.18 : 0.12));
  const phX = Math.round(W * 0.035);
  const phY = Math.round(H * 0.13);
  const phH = Math.round(phSz * 1.2);

  // Build photo
  let photoSection = '';
  if (showPhoto) {
    let photoBase64 = '';
    let mime = 'image/jpeg';
    if (photoUrl) {
      try {
        let absUrl = photoUrl;
        if (photoUrl.startsWith('/')) absUrl = `https://skoolar.org${photoUrl}`;
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 5000);
        const res = await fetch(absUrl, { signal: ctrl.signal, headers: { 'User-Agent': 'Skoolar-ID/1.0' } });
        clearTimeout(tid);
        if (res.ok) {
          const ct = res.headers.get('content-type') || '';
          if (ct.startsWith('image/')) {
            const buf = await res.arrayBuffer();
            photoBase64 = Buffer.from(new Uint8Array(buf)).toString('base64');
            mime = ct;
          }
        }
      } catch (_) { /* photo fetch failed, fall through to placeholder */ }
    }
    if (photoBase64 && photoBase64.length > 100) {
      photoSection = `
        <defs><clipPath id="pc"><rect x="${phX + 2}" y="${phY + 2}" width="${phSz - 4}" height="${phH - 4}" rx="${Math.round(phSz * 0.06)}"/></clipPath></defs>
        <rect x="${phX}" y="${phY}" width="${phSz}" height="${phH}" rx="${Math.round(phSz * 0.07)}" fill="${colors.primary}" opacity="0.08"/>
        <image x="${phX + 2}" y="${phY + 2}" width="${phSz - 4}" height="${phH - 4}" href="data:${mime};base64,${photoBase64}" clip-path="url(#pc)" preserveAspectRatio="xMidYMid slice"/>`;
    } else {
      photoSection = `
        <rect x="${phX}" y="${phY}" width="${phSz}" height="${phH}" rx="${Math.round(phSz * 0.07)}" fill="${colors.primary}" opacity="0.06"/>
        <rect x="${phX + 2}" y="${phY + 2}" width="${phSz - 4}" height="${phH - 4}" rx="${Math.round(phSz * 0.06)}" fill="none" stroke="${colors.primary}" stroke-width="1.5" opacity="0.3"/>
        <circle cx="${phX + phSz / 2}" cy="${phY + phH * 0.45}" r="${Math.round(phSz * 0.28)}" fill="${colors.primary}" opacity="0.12"/>
        <text x="${phX + phSz / 2}" y="${phY + phH * 0.45 + Math.round(phSz * 0.1)}" font-family="Arial,sans-serif" font-size="${Math.round(phSz * 0.3)}" font-weight="bold" fill="${colors.primary}" text-anchor="middle">${initials}</text>
        <text x="${phX + phSz / 2}" y="${phY + phH * 0.88}" font-family="Arial,sans-serif" font-size="${Math.round(phSz * 0.09)}" fill="#666" text-anchor="middle">PHOTO</text>`;
    }
  }

  // ─── SVG Dimensions ───────────────────────────────────────
  const hdrH = Math.round(H * 0.065);
  const fsHdrTitle = Math.round(H * 0.022);
  const fsHdrSub = Math.round(H * 0.014);

  const infoLeft = Math.round(phX + phSz + W * 0.035);
  const infoTop = phY;

  const fsName = Math.round(H * 0.026);
  const fsBadge = Math.round(H * 0.014);
  const fsDetail = Math.round(H * 0.014);
  const fsWm = Math.round(H * 0.009);

  const lh = Math.round(H * 0.026); // line height for details

  // QR
  let qrSz = 0, qrX = 0, qrY = 0;
  if (showQR && qrBase64) {
    qrSz = Math.round(isPortrait ? H * 0.22 : W * 0.20);
    qrX = Math.round(W - qrSz - W * 0.035);
    qrY = Math.round(H - qrSz - H * 0.045);
  }

  // Layout info lines
  const infoLines: { label: string; value: string }[] = [];
  if (personType === 'student') {
    infoLines.push({ label: 'Class', value: className });
    infoLines.push({ label: 'Gender', value: gender });
  } else {
    if (role) infoLines.push({ label: 'Role', value: role });
    if (phone) infoLines.push({ label: 'Phone', value: phone });
  }

  // ─── Barcode fallback ─────────────────────────────────────
  let barcodeSvg = '';
  if (showBarcode && !showQR) {
    const bcW = Math.round(W * 0.2);
    const bcH = Math.round(H * 0.06);
    const bcX = infoLeft;
    const bcY = Math.round(infoTop + lh * 3 + H * 0.02);
    const barCount = 40;
    barcodeSvg = Array.from({ length: barCount }).map((_, i) =>
      `<rect x="${bcX + i * 2}" y="${bcY + 4}" width="${i % 2 === 0 ? 1.5 : 1}" height="${bcH - 8}" fill="#333" />`
    ).join('');
  }

  const frontSVG = `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hdrG" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${colors.primary}" stop-opacity="1" />
        <stop offset="100%" stop-color="${adjustColor(colors.primary, -25)}" stop-opacity="1" />
      </linearGradient>
      <linearGradient id="accG" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${adjustColor(colors.primary, 20)}" stop-opacity="0.08" />
        <stop offset="100%" stop-color="${colors.secondary}" stop-opacity="0" />
      </linearGradient>
    </defs>

    <rect width="100%" height="100%" fill="${colors.secondary}"/>
    <rect width="100%" height="100%" fill="url(#accG)"/>

    <!-- Header -->
    <rect x="0" y="0" width="100%" height="${hdrH}" fill="url(#hdrG)"/>
    <text x="${Math.round(W * 0.04)}" y="${Math.round(hdrH * 0.62)}" font-family="Arial,sans-serif" font-size="${fsHdrTitle}" font-weight="bold" fill="white">${schoolName.substring(0, isPortrait ? 18 : 26)}</text>
    <text x="${W - Math.round(W * 0.04)}" y="${Math.round(hdrH * 0.62)}" font-family="Arial,sans-serif" font-size="${fsHdrSub}" fill="rgba(255,255,255,0.85)" text-anchor="end">ID CARD</text>

    <!-- Photo -->
    ${photoSection}

    <!-- Name -->
    <text x="${infoLeft}" y="${infoTop + Math.round(phH * 0.28)}" font-family="Arial,sans-serif" font-size="${fsName}" font-weight="bold" fill="${colors.primary}">${person.name || 'Unknown'}</text>

    <!-- Role badge -->
    <rect x="${infoLeft}" y="${infoTop + Math.round(phH * 0.38)}" width="${Math.round(W * 0.12)}" height="${Math.round(H * 0.022)}" rx="${Math.round(H * 0.006)}" fill="none" stroke="${colors.primary}" stroke-width="1.2"/>
    <text x="${infoLeft + Math.round(W * 0.06)}" y="${infoTop + Math.round(phH * 0.38 + H * 0.016)}" font-family="Arial,sans-serif" font-size="${fsBadge}" font-weight="bold" fill="${colors.primary}" text-anchor="middle">${role}</text>

    <!-- Display ID -->
    <text x="${infoLeft}" y="${infoTop + Math.round(phH * 0.55)}" font-family="Arial,sans-serif" font-size="${fsDetail}" fill="#555">
      ID: <tspan font-weight="bold">${displayId}</tspan>
    </text>

    ${infoLines.map((line, i) => `
      <text x="${infoLeft}" y="${infoTop + Math.round(phH * 0.55 + (i + 1) * lh)}" font-family="Arial,sans-serif" font-size="${fsDetail}" fill="#555">${line.label}: <tspan font-weight="bold">${line.value}</tspan></text>
    `).join('')}

    <!-- QR Code -->
    ${showQR && qrBase64 ? `
      <rect x="${qrX}" y="${qrY}" width="${qrSz}" height="${qrSz}" rx="${Math.round(qrSz * 0.07)}" fill="white" stroke="${colors.primary}" stroke-width="2.5"/>
      <rect x="${qrX + Math.round(qrSz * 0.06)}" y="${qrY + Math.round(qrSz * 0.06)}" width="${Math.round(qrSz * 0.88)}" height="${Math.round(qrSz * 0.88)}" rx="${Math.round(qrSz * 0.04)}" fill="${colors.secondary}"/>
      <image x="${qrX + Math.round(qrSz * 0.12)}" y="${qrY + Math.round(qrSz * 0.12)}" width="${Math.round(qrSz * 0.76)}" height="${Math.round(qrSz * 0.76)}" href="data:image/png;base64,${qrBase64}"/>
      <text x="${qrX + qrSz / 2}" y="${qrY + qrSz + Math.round(H * 0.016)}" font-family="Arial,sans-serif" font-size="${Math.round(qrSz * 0.1)}" font-weight="bold" fill="#333" text-anchor="middle">SCAN ME</text>
    ` : ''}

    <!-- Barcode fallback -->
    ${barcodeSvg}

    <!-- Footer -->
    <rect x="0" y="${H - Math.round(H * 0.025)}" width="100%" height="${Math.round(H * 0.025)}" fill="${colors.primary}" opacity="0.07"/>
    <text x="50%" y="${H - Math.round(H * 0.01)}" font-family="Arial,sans-serif" font-size="${fsWm}" fill="#999" text-anchor="middle">Skoolar - Odebunmi Tawwāb</text>
  </svg>`;

  return sharp(Buffer.from(frontSVG)).png({ quality: 100 }).toBuffer();
}

export function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
