import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import type { BookingRecord } from '../components/SevaBookingModal';

const MAPS_URL = 'https://maps.google.com/?q=Sri+Siddheswari+Peetham,Courtallam,627802,Tamil+Nadu';

// White-background palette
const RED:        [number, number, number] = [160, 45, 35];
const DARK_RED:   [number, number, number] = [120, 30, 22];   // section header text
const INK:        [number, number, number] = [28, 18, 12];    // primary body text
const LABEL:      [number, number, number] = [110, 85, 65];   // row label / muted text
const VALUE:      [number, number, number] = [35, 22, 14];    // row value text
const ROW_BG:     [number, number, number] = [250, 247, 244]; // alternating row tint
const STRIP_BG:   [number, number, number] = [245, 240, 235]; // booking ID strip
const SECTION_BG: [number, number, number] = [238, 225, 215]; // section header band
const GOLD_TEXT:  [number, number, number] = [140, 100, 20];  // gold on white (darker)
const FOOTER_BG:  [number, number, number] = [242, 237, 232]; // footer band
const WHITE:      [number, number, number] = [255, 255, 255];
const CREAM:      [number, number, number] = [253, 251, 247]; // text on red header

// jsPDF Helvetica does not include the Indian Rupee glyph — use "Rs." prefix
const rs = (amount: number) => `Rs. ${amount.toLocaleString('en-IN')}`;

function drawPaymentLogo(doc: jsPDF, x: number, y: number, method: string) {
  doc.setFont('helvetica', 'normal');
  if (method.includes('visa')) {
    doc.setFillColor(26, 31, 113); // Visa Blue
    doc.roundedRect(x, y, 14, 8, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(5.5);
    doc.text('VISA', x + 7, y + 5.5, { align: 'center' });
  } else if (method.includes('mastercard')) {
    doc.setFillColor(235, 0, 27); // MC Red
    doc.circle(x + 5, y + 4, 3.8, 'F');
    doc.setFillColor(255, 153, 0); // MC Orange
    doc.circle(x + 9, y + 4, 3.8, 'F');
  } else if (method.includes('rupay')) {
    doc.setTextColor(34, 49, 119); // RuPay Blue
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(7);
    doc.text('RuPay', x + 7, y + 6, { align: 'center' });
  } else if (method === 'upi') {
    doc.setTextColor(0, 142, 204); // UPI Blue
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(8);
    doc.text('UPI', x + 7, y + 6, { align: 'center' });
  } else if (method.includes('netbanking')) {
    doc.setFillColor(RED[0], RED[1], RED[2]);
    doc.rect(x + 2, y + 1, 10, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4);
    doc.text('BANK', x + 7, y + 5, { align: 'center' });
  }
}

async function toBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.readAsDataURL(blob);
  });
}

async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { width: 200, margin: 1, color: { dark: '#1c120c', light: '#ffffff' } });
}

export async function downloadBookingPDF(booking: BookingRecord): Promise<void> {
  const logoMod = await import('../assets/Logo.png');
  const [bookingQR, mapsQR, logoBase64] = await Promise.all([
    qrDataUrl(`SSP-BOOKING:${booking.id}`),
    qrDataUrl(MAPS_URL),
    toBase64(logoMod.default),
  ]);

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const W = 210, M = 16;
  const CW = W - 2 * M;
  let y = 0;

  // ── White page background ────────────────────────────────────
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, 210, 297, 'F');

  // ── Red header band ──────────────────────────────────────────
  doc.setFillColor(...RED);
  doc.rect(0, 0, 210, 44, 'F');

  // Logo
  doc.addImage(logoBase64, 'PNG', M, 8, 20, 20, '', 'FAST');

  // Temple name + address (on red — keep cream text)
  doc.setTextColor(...CREAM);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Sri Siddheswari Peetham', 40, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(240, 220, 190);
  doc.text('Courtallam – 627 802, Tenkasi District, Tamil Nadu', 40, 23);
  doc.text('+91 9443184738  |  feedback@srisiddheshwaripeetham.com', 40, 30);

  // Seva type badge (top right)
  const isOnline = booking.sevaType === 'online';
  doc.setFillColor(...CREAM);
  doc.roundedRect(W - M - 36, 8, 36, 9, 4, 4, 'F');
  doc.setTextColor(...(isOnline ? [20, 130, 90] as [number,number,number] : DARK_RED));
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text(isOnline ? 'ONLINE SEVA' : 'TEMPLE VISIT', W - M - 18, 13.5, { align: 'center' });

  // Receipt badge
  doc.setFillColor(50, 25, 10);
  doc.roundedRect(W - M - 36, 22, 36, 9, 4, 4, 'F');
  doc.setTextColor(...CREAM);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text('SEVA RECEIPT', W - M - 18, 27.5, { align: 'center' });

  y = 52;

  // ── Booking ID strip ─────────────────────────────────────────
  doc.setFillColor(...STRIP_BG);
  doc.roundedRect(M, y, CW, 18, 3, 3, 'F');
  // left accent bar
  doc.setFillColor(...RED);
  doc.roundedRect(M, y, 3, 18, 1, 1, 'F');

  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(booking.id, M + 8, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...LABEL);
  doc.text(
    `Issued: ${new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    M + 8, y + 15
  );
  doc.setTextColor(...LABEL);
  
  // Format payment method display
  let pmLabel = booking.paymentMethod.toUpperCase();
  if (booking.paymentMethod.includes('-card')) {
    const brand = booking.paymentMethod.split('-')[0];
    pmLabel = `${brand.charAt(0).toUpperCase() + brand.slice(1)} Card`;
  } else if (booking.paymentMethod.includes('-netbanking')) {
    const bank = booking.paymentMethod.split('-')[0];
    pmLabel = `${bank.toUpperCase()} Net Banking`;
  } else if (booking.paymentMethod === 'upi') {
    pmLabel = 'UPI Payment';
  }

  // Draw payment info badge on the right
  const badgeW = 50;
  const badgeX = M + CW - badgeW;
  doc.setFillColor(...FOOTER_BG);
  doc.roundedRect(badgeX, y + 1, badgeW, 16, 2, 2, 'F');
  
  drawPaymentLogo(doc, badgeX + 2, y + 5, booking.paymentMethod);
  
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(pmLabel, M + CW - 5, y + 9.5, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(20, 130, 90); // Green for confirmed status
  doc.text('STATUS: CONFIRMED', M + CW - 5, y + 14, { align: 'right' });

  y += 24;

  // ── Section helper ───────────────────────────────────────────
  const section = (title: string, rows: [string, string][]): void => {
    // Section header band
    doc.setFillColor(...SECTION_BG);
    doc.roundedRect(M, y, CW, 9, 2, 2, 'F');
    doc.setFillColor(...RED);
    doc.roundedRect(M, y, 3, 9, 1, 1, 'F');
    doc.setTextColor(...DARK_RED);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(title, M + 7, y + 6.2);
    y += 12;

    for (const [k, v] of rows) {
      doc.setFillColor(...ROW_BG);
      doc.rect(M, y - 1, CW, 7.5, 'F');
      doc.setTextColor(...LABEL);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(k, M + 4, y + 4.5);
      doc.setTextColor(...VALUE);
      doc.setFont('helvetica', 'bold');
      const maxW = CW - 55;
      const lines = doc.splitTextToSize(v, maxW);
      doc.text(lines, M + CW - 4, y + 4.5, { align: 'right' });
      y += lines.length > 1 ? 9 * lines.length : 8;
    }
    y += 4;
  };

  // ── Devotee section ──────────────────────────────────────────
  const devoteeRows: [string, string][] = [
    ['Name',     booking.devotee.name],
    ['Phone',    booking.devotee.phone],
    ['Email',    booking.devotee.email],
    ['Location', `${booking.devotee.city}, ${booking.devotee.state}`],
  ];
  if (booking.devotee.gotra)       devoteeRows.push(['Gotra', booking.devotee.gotra]);
  if (booking.familyMembers.length) devoteeRows.push(['Family Members', booking.familyMembers.join(', ')]);
  section('DEVOTEE', devoteeRows);

  // ── Seva section ─────────────────────────────────────────────
  const sevaRows: [string, string][] = [
    ['Date',      booking.date],
    ['Seva Mode', isOnline ? 'Online — No temple visit required' : 'Offline — Please visit temple'],
  ];
  if (booking.slot) sevaRows.push(['Time Slot', `${booking.slot.time} — ${booking.slot.name}`]);
  for (const ds of booking.deitySevas) {
    sevaRows.push([ds.deity.name, `${ds.seva}  ·  ${rs(ds.price)}`]);
  }
  section('SEVA DETAILS', sevaRows);

  // ── Total bar ────────────────────────────────────────────────
  doc.setFillColor(...RED);
  doc.roundedRect(M, y, CW, 16, 3, 3, 'F');
  doc.setTextColor(...CREAM);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total Paid', M + 5, y + 10.5);
  doc.setFontSize(13);
  doc.text(rs(booking.total), M + CW - 5, y + 10.5, { align: 'right' });
  y += 22;

  // ── QR Codes row ─────────────────────────────────────────────
  const qrSz = 38;
  const labelY = y + qrSz + 6;

  // Left QR: booking verification
  doc.setFillColor(...WHITE);
  doc.setDrawColor(220, 210, 200);
  doc.roundedRect(M - 1, y - 1, qrSz + 2, qrSz + 2, 3, 3, 'FD');
  doc.addImage(bookingQR, 'PNG', M, y, qrSz, qrSz, '', 'FAST');
  doc.setTextColor(...LABEL);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Scan to verify booking', M + qrSz / 2, labelY, { align: 'center' });

  // Centre text
  const cx = M + qrSz + (CW - 2 * qrSz) / 2;
  doc.setTextColor(...GOLD_TEXT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Om Namah Shivaya', cx, y + qrSz / 2 - 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...LABEL);
  doc.text('Sri Siddheswari Peetham', cx, y + qrSz / 2 + 4, { align: 'center' });
  doc.text('Courtallam, Tamil Nadu', cx, y + qrSz / 2 + 11, { align: 'center' });

  // Right QR: Google Maps
  const mapsX = M + CW - qrSz;
  doc.setFillColor(...WHITE);
  doc.setDrawColor(220, 210, 200);
  doc.roundedRect(mapsX - 1, y - 1, qrSz + 2, qrSz + 2, 3, 3, 'FD');
  doc.addImage(mapsQR, 'PNG', mapsX, y, qrSz, qrSz, '', 'FAST');
  doc.setTextColor(...LABEL);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Scan for directions', mapsX + qrSz / 2, labelY, { align: 'center' });

  y = labelY + 10;

  // ── Footer ───────────────────────────────────────────────────
  doc.setFillColor(...FOOTER_BG);
  doc.rect(0, 285, 210, 12, 'F');
  doc.setFillColor(...RED);
  doc.rect(0, 285, 210, 1.5, 'F');
  doc.setTextColor(...LABEL);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(
    'Computer-generated receipt — no signature required. Valid subject to confirmation by temple authorities.',
    105, 290, { align: 'center' }
  );
  doc.text(
    'Om Sri Rajarajeshwaryai Namah  ·  Sri Siddheswari Peetham, Courtallam  ·  srisiddheshwaripeetham.com',
    105, 295, { align: 'center' }
  );

  doc.save(`SSP-Receipt-${booking.id}.pdf`);
}
