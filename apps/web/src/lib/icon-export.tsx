import { renderToStaticMarkup } from 'react-dom/server';
import { icons, resourceIcons } from '@/data/icons';

export type Design = {
  label: string; value: string; mode: 'icon' | 'label' | 'value' | 'both'; product: 'icon' | 'logo'; logoLayout: 'circle' | 'shield' | 'horizontal'; orientation: 'vertical' | 'horizontal'; iconColor: string; textColor: string; stroke: number; iconSize: number; fontSize: number; gap: number; align: 'start' | 'center' | 'end'; padding: number; background: 'none' | 'circle' | 'square' | 'pill'; bgColor: string; bgOpacity: number; radius: number; shadow: boolean; shadowBlur: number; shadowDistance: number; shadowAngle: number; shadowOpacity: number; shadowColor: string; fontFamily: string; resourceSymbol: 'none' | 'shield' | 'star' | 'sparkles' | 'gem' | 'sunrise';
};
export const defaultDesign = (name = 'Fecha', value = ''): Design => ({ label: name, value, mode: 'both', product: 'icon', logoLayout: 'circle', orientation: 'vertical', iconColor: '#E9BD76', textColor: '#F5F2E9', stroke: 2, iconSize: 170, fontSize: 48, gap: 24, align: 'center', padding: 60, background: 'none', bgColor: '#142B43', bgOpacity: 100, radius: 40, shadow: true, shadowBlur: 10, shadowDistance: 8, shadowAngle: 90, shadowOpacity: 28, shadowColor: '#000000', fontFamily: 'Ringbearer' as const, resourceSymbol: 'none' });

const escapeXml = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c] || c);

export function makeSvg(key: string, d: Design): string {
  const entry = icons.find(i => i.key === key) || icons[0];
  const showLabel = d.mode === 'label' || d.mode === 'both';
  const showValue = d.mode === 'value' || d.mode === 'both';
  const lines = [showLabel ? d.label : '', showValue ? d.value : ''].filter(Boolean);
  const vertical = d.product === 'logo' ? d.logoLayout !== 'horizontal' : d.orientation === 'vertical';
  const font = d.fontSize;
  const textWidth = Math.max(0, ...lines.map(l => l.length * font * .62));
  const textHeight = lines.length * font * 1.25;
  const logoFrame = d.product === 'logo' ? Math.max(d.iconSize + 34, 190) : 0;
  const symbolSize = d.product === 'logo' ? logoFrame : d.iconSize;
  const contentWidth = vertical ? Math.max(symbolSize, textWidth) : symbolSize + (lines.length ? d.gap + textWidth : 0);
  const contentHeight = vertical ? symbolSize + (lines.length ? d.gap + textHeight : 0) : Math.max(symbolSize, textHeight);
  const width = Math.max(1, Math.ceil(contentWidth + 2 * d.padding));
  const height = Math.max(1, Math.ceil(contentHeight + 2 * d.padding));
  const iconX = vertical ? (width - d.iconSize) / 2 : d.padding + (symbolSize - d.iconSize) / 2;
  const iconY = vertical ? d.padding + (symbolSize - d.iconSize) / 2 : (height - d.iconSize) / 2;
  const frameX = vertical ? (width - symbolSize) / 2 : d.padding;
  const frameY = vertical ? d.padding : (height - symbolSize) / 2;
  const textX = vertical ? (d.align === 'start' ? d.padding : d.align === 'end' ? width - d.padding : width / 2) : d.padding + symbolSize + d.gap;
  const anchor = vertical ? ({ start: 'start', center: 'middle', end: 'end' } as const)[d.align] : 'start';
  const textTop = vertical ? d.padding + symbolSize + d.gap : (height - textHeight) / 2;
  const SymbolIcon = d.resourceSymbol !== 'none' ? resourceIcons[d.resourceSymbol] : entry.Icon;
  const iconMarkup = renderToStaticMarkup(<SymbolIcon x={iconX} y={iconY} width={d.iconSize} height={d.iconSize} color={d.iconColor} strokeWidth={d.stroke} />);
  const shape = d.background === 'none' ? '' : d.background === 'circle' ? `<ellipse cx="${width / 2}" cy="${height / 2}" rx="${width / 2}" ry="${height / 2}" fill="${d.bgColor}" fill-opacity="${d.bgOpacity / 100}"/>` : `<rect width="${width}" height="${height}" rx="${d.background === 'pill' ? height / 2 : d.radius}" fill="${d.bgColor}" fill-opacity="${d.bgOpacity / 100}"/>`;
  const frame = d.product === 'logo' ? logoFrameMarkup(d, frameX, frameY, symbolSize) : '';
  const texts = lines.map((line, i) => `<text x="${textX}" y="${textTop + (i + .82) * font * 1.25}" text-anchor="${anchor}" fill="${d.textColor}" font-family="${fontStack(d.fontFamily)}" font-size="${font}" font-weight="${i === 0 && showLabel ? 700 : 500}" letter-spacing="0">${escapeXml(line)}</text>`).join('');
  const rad = (d.shadowAngle - 90) * Math.PI / 180;
  const dx = Math.cos(rad) * d.shadowDistance;
  const dy = Math.sin(rad) * d.shadowDistance;
  const shadowGroup = `<g opacity="${d.shadowOpacity / 100}" transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)})" filter="url(#s)">${shape}${frame}${iconMarkup}${texts}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><filter id="s" x="-40%" y="-40%" width="180%" height="180%"><feFlood flood-color="${d.shadowColor}" flood-opacity="1"/><feComposite in2="SourceAlpha" operator="in"/><feGaussianBlur stdDeviation="${d.shadowBlur}"/></filter></defs>${d.shadow ? shadowGroup : ''}${shape}${frame}${iconMarkup}${texts}</svg>`;
}

function fontStack(font: string) {
  if (font.toLowerCase().includes('ringbearer')) return 'Ringbearer, Cinzel, Georgia, Times New Roman, serif';
  if (font.toLowerCase().includes('outfit')) return 'Outfit, Arial, Helvetica, sans-serif';
  return 'Manrope, Arial, Helvetica, sans-serif';
}

function logoFrameMarkup(d: Design, x: number, y: number, size: number) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const color = d.iconColor;
  if (d.logoLayout === 'shield') return `<path d="M${cx} ${y + 10} C${x + size - 20} ${y + 26} ${x + size - 18} ${y + 54} ${x + size - 24} ${y + size * .55} C${x + size - 35} ${y + size * .82} ${cx} ${y + size - 9} ${cx} ${y + size - 9} C${cx} ${y + size - 9} ${x + 35} ${y + size * .82} ${x + 24} ${y + size * .55} C${x + 18} ${y + 54} ${x + 20} ${y + 26} ${cx} ${y + 10} Z" fill="none" stroke="${color}" stroke-width="${Math.max(2, d.stroke)}"/>`;
  if (d.logoLayout === 'horizontal') return `<rect x="${x + 8}" y="${y + 8}" width="${size - 16}" height="${size - 16}" rx="${size * .18}" fill="none" stroke="${color}" stroke-width="${Math.max(2, d.stroke)}"/>`;
  return `<circle cx="${cx}" cy="${cy}" r="${size / 2 - 10}" fill="none" stroke="${color}" stroke-width="${Math.max(2, d.stroke)}"/><circle cx="${cx}" cy="${cy}" r="${size / 2 - 23}" fill="none" stroke="${color}" stroke-width="${Math.max(1.2, d.stroke * .55)}" opacity=".65"/>`;
}

export async function pngBlob(key: string, design: Design, size: number, crop: boolean): Promise<Blob> {
  const svg = makeSvg(key, design);
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('No se pudo preparar la imagen.')); img.src = url; });
    const source = document.createElement('canvas');
    source.width = Math.ceil(img.naturalWidth); source.height = Math.ceil(img.naturalHeight);
    const ctx = source.getContext('2d');
    if (!ctx) throw new Error('El navegador no admite la exportación.');
    ctx.drawImage(img, 0, 0);
    let left = 0, top = 0, right = source.width, bottom = source.height;
    if (crop) {
      const pixels = ctx.getImageData(0, 0, source.width, source.height).data;
      left = source.width; top = source.height; right = 0; bottom = 0;
      for (let y = 0; y < source.height; y++) for (let x = 0; x < source.width; x++) if (pixels[(y * source.width + x) * 4 + 3] > 3) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1); }
      if (right <= left) { left = 0; top = 0; right = source.width; bottom = source.height; }
    }
    const boxW = right - left, boxH = bottom - top;
    const output = document.createElement('canvas');
    output.width = Math.max(1, Math.round(size * boxW / Math.max(boxW, boxH)));
    output.height = Math.max(1, Math.round(size * boxH / Math.max(boxW, boxH)));
    const out = output.getContext('2d');
    if (!out) throw new Error('El navegador no admite la exportación.');
    out.drawImage(source, left, top, boxW, boxH, 0, 0, output.width, output.height);
    return await new Promise<Blob>((resolve, reject) => output.toBlob(blob => blob ? resolve(blob) : reject(new Error('No se pudo crear el PNG.')), 'image/png'));
  } finally { URL.revokeObjectURL(url); }
}

export function slug(s: string) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'grupo'; }
export function downloadBlob(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000); }
