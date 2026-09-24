import { useMemo, useState } from 'react';
import { ArrowLeft, Copy, Download, Eye, Heart, Redo2, RotateCcw, SendToBack, Undo2 } from 'lucide-react';
import { icons, resourceIcons, type AdminStore, type Profile, profileValue } from '@/data/icons';
import { defaultDesign, downloadBlob, makeSvg, pngBlob, slug, type Design } from '@/lib/icon-export';

const colors = [{ name: 'Blanco calido', hex: '#F5F2E9' }, { name: 'Dorado institucional', hex: '#E9BD76' }, { name: 'Azul claro', hex: '#A8C7DA' }, { name: 'Negro', hex: '#17212B' }];
const presets: { name: string; iconColor: string; textColor: string; bgColor: string; background: Design['background']; product?: Design['product']; logoLayout?: Design['logoLayout'] }[] = [
  { name: 'Institucional blanco', iconColor: '#F5F2E9', textColor: '#F5F2E9', bgColor: '#142B43', background: 'none' },
  { name: 'Dorado FGDLL', iconColor: '#E9BD76', textColor: '#E9BD76', bgColor: '#142B43', background: 'none' },
  { name: 'Logotipo medallon', iconColor: '#E9BD76', textColor: '#F5F2E9', bgColor: '#142B43', background: 'none', product: 'logo', logoLayout: 'circle' },
  { name: 'Escudo de grupo', iconColor: '#E9BD76', textColor: '#F5F2E9', bgColor: '#142B43', background: 'none', product: 'logo', logoLayout: 'shield' },
];

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <div className="color-control"><span className="control-label">{label}</span><div className="color-row">{colors.map(c => <button title={c.name} aria-label={`${label}: ${c.name}`} key={c.hex} className={`color-swatch ${value.toLowerCase() === c.hex.toLowerCase() ? 'chosen' : ''}`} style={{ background: c.hex }} onClick={() => onChange(c.hex)}/>)}<label className="color-picker" title="Color personalizado"><input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#ffffff'} onChange={e => onChange(e.target.value)} aria-label={`Elegir ${label.toLowerCase()}`}/></label><input className="hex-input" aria-label={`${label} HEX`} value={value} maxLength={7} onChange={e => onChange(e.target.value)} onBlur={() => { if (!/^#[0-9a-f]{6}$/i.test(value)) onChange('#F5F2E9'); }}/></div></div>;
}

function Range({ label, value, min, max, unit = 'px', onChange }: { label: string; value: number; min: number; max: number; unit?: string; onChange: (n: number) => void }) {
  return <label className="range-field"><span>{label}<strong>{value}{unit}</strong></span><input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}/></label>;
}

export function Editor({ iconKey, profile, adminStore, favorites, onToggleFavorite, onBack }: { iconKey: string; profile: Profile | null; adminStore: AdminStore; favorites: string[]; onToggleFavorite: (key: string) => void; onBack: () => void }) {
  const entry = icons.find(i => i.key === iconKey) || icons[0];
  const initial = useMemo(() => defaultDesign(entry.name, profileValue(iconKey, profile)), [entry.name, iconKey, profile]);
  const [design, setDesignState] = useState<Design>(initial);
  const [undoStack, setUndoStack] = useState<Design[]>([]);
  const [redoStack, setRedoStack] = useState<Design[]>([]);
  const [size, setSize] = useState(1024);
  const [crop, setCrop] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const visibleResources = adminStore.resources.filter(r => r.status === 'visible').sort((a, b) => a.order - b.order);
  const visibleFonts = adminStore.fonts.filter(f => f.status === 'visible' && f.visible).sort((a, b) => a.order - b.order);
  const isFavorite = favorites.includes(iconKey);

  function update(next: Design) {
    setUndoStack(prev => [...prev.slice(-39), design]);
    setRedoStack([]);
    setDesignState(next);
  }
  const set = <K extends keyof Design>(key: K, value: Design[K]) => update({ ...design, [key]: value });
  function undo() { const previous = undoStack.at(-1); if (!previous) return; setRedoStack(prev => [design, ...prev].slice(0, 40)); setUndoStack(prev => prev.slice(0, -1)); setDesignState(previous); }
  function redo() { const next = redoStack[0]; if (!next) return; setUndoStack(prev => [...prev, design].slice(-40)); setRedoStack(prev => prev.slice(1)); setDesignState(next); }
  function reset() { update(initial); }

  async function exportImage(copy = false, forTools = false) {
    setBusy(true); setMessage('');
    try {
      const blob = await pngBlob(iconKey, design, size, crop);
      if (copy) {
        if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('Tu navegador no permite copiar imagenes. Usa Descargar PNG.');
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setMessage('Imagen copiada al portapapeles.');
      } else {
        const suffix = forTools ? 'herramientas-fgdll' : design.product;
        downloadBlob(blob, `fgdll-${slug(profile?.zone || profile?.name || 'grupo')}-${iconKey}-${suffix}.png`);
        setMessage(forTools ? 'Archivo preparado para subirlo a herramientas.fgdll.org. No se simulo una subida directa.' : 'PNG descargado con transparencia.');
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'No se pudo exportar el icono.');
    } finally {
      setBusy(false);
    }
  }

  const preview = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(makeSvg(iconKey, design))}`;
  return <div className="editor-page">
    <div className="editor-top"><button className="back-btn" onClick={onBack}><ArrowLeft size={19}/> Biblioteca</button><span className="eyebrow">ESTUDIO / {design.product === 'logo' ? 'LOGOTIPO' : entry.category.toUpperCase()}</span></div>
    <div className="editor-heading"><div><h2>{design.product === 'logo' ? 'Logotipo' : entry.name}<span className="gold-dot">.</span></h2><p>Ringbearer queda como tipografia predeterminada para el nombre del grupo.</p></div><div className="editor-actions"><button className="secondary-btn reset-btn" onClick={undo} disabled={!undoStack.length}><Undo2 size={16}/> Deshacer</button><button className="secondary-btn reset-btn" onClick={redo} disabled={!redoStack.length}><Redo2 size={16}/> Rehacer</button><button className="secondary-btn reset-btn" onClick={reset}><RotateCcw size={16}/> Restablecer</button></div></div>
    <div className="editor-layout"><div className="controls-column">
      <section className="control-panel"><span className="eyebrow">01 / TIPO</span><h3>Icono o logotipo</h3><div className="choice-grid two">{([['icon','Icono'],['logo','Logotipo']] as const).map(([v,label]) => <button key={v} className={design.product === v ? 'selected' : ''} onClick={() => set('product', v)}>{label}</button>)}</div>{design.product === 'logo' && <><span className="control-label">Composicion</span><div className="choice-grid three">{([['circle','Circular'],['shield','Escudo'],['horizontal','Horizontal']] as const).map(([v,label]) => <button key={v} className={design.logoLayout === v ? 'selected' : ''} onClick={() => set('logoLayout', v)}>{label}</button>)}</div></>}</section>
      <section className="control-panel"><span className="eyebrow">02 / CONTENIDO</span><h3>Texto y composición</h3><label className="field"><span>Nombre / etiqueta</span><input value={design.label} onChange={e => set('label', e.target.value)} placeholder="Nombre del grupo"/></label><label className="field"><span>Dato, lema o subtitulo</span><input value={design.value} onChange={e => set('value', e.target.value)} placeholder="Lema, fecha o dato"/></label><span className="control-label">Contenido visible</span><div className="choice-grid">{([['icon','Solo simbolo'],['label','Simbolo + nombre'],['value','Simbolo + dato'],['both','Nombre + dato']] as const).map(([v,label]) => <button key={v} className={design.mode === v ? 'selected' : ''} onClick={() => set('mode', v)}>{label}</button>)}</div><div className="paired"><div><span className="control-label">Orientacion</span><div className="choice-grid two">{(['vertical','horizontal'] as const).map(v => <button key={v} className={design.orientation === v ? 'selected' : ''} onClick={() => set('orientation', v)}>{v === 'vertical' ? 'Vertical' : 'Horizontal'}</button>)}</div></div><div><span className="control-label">Alineacion</span><div className="choice-grid three">{(['start','center','end'] as const).map((v,i) => <button key={v} className={design.align === v ? 'selected' : ''} onClick={() => set('align', v)}>{['Inicio','Centro','Final'][i]}</button>)}</div></div></div></section>
      <section className="control-panel"><span className="eyebrow">03 / ESTILO</span><h3>Color, fuente y trazo</h3><div className="preset-list">{presets.map(p => <button key={p.name} onClick={() => update({ ...design, iconColor: p.iconColor, textColor: p.textColor, bgColor: p.bgColor, background: p.background, product: p.product || design.product, logoLayout: p.logoLayout || design.logoLayout })}><span className="preset-dot" style={{ background: p.iconColor }}/>{p.name}</button>)}</div><label className="field"><span>Tipografia</span><select value={design.fontFamily} onChange={e => set('fontFamily', e.target.value)}>{visibleFonts.map(font => <option key={font.id} value={font.name}>{font.name}{font.defaultForGroupName ? ' · predeterminada' : ''}</option>)}</select></label><ColorControl label="Color del icono" value={design.iconColor} onChange={v => set('iconColor', v)}/><ColorControl label="Color del texto" value={design.textColor} onChange={v => set('textColor', v)}/><span className="control-label">Grosor de linea</span><div className="choice-grid three">{([[1.25,'Fino'],[2,'Normal'],[3,'Fuerte']] as const).map(([v,label]) => <button key={v} className={design.stroke === v ? 'selected' : ''} onClick={() => set('stroke', v)}>{label}</button>)}</div></section>
      <section className="control-panel"><span className="eyebrow">04 / RECURSOS BASE</span><h3>Loguitos</h3><p className="panel-note">Recursos que el admin puede cambiar: escudos, medallones, marcos, sellos, cintas y fondos.</p><div className="resource-picker">{visibleResources.map(resource => { const Icon = resourceIcons[resource.symbol]; return <button key={resource.id} onClick={() => set('resourceSymbol', resource.symbol)} className={design.resourceSymbol === resource.symbol ? 'selected' : ''}><Icon size={20}/><span>{resource.name}</span><small>{resource.kind}</small></button>; })}</div></section>
      <section className="control-panel"><span className="eyebrow">05 / DIMENSIONES</span><h3>Ajustes finos</h3><Range label="Tamaño del icono" value={design.iconSize} min={60} max={320} onChange={v => set('iconSize', v)}/><Range label="Tamaño del texto" value={design.fontSize} min={20} max={96} onChange={v => set('fontSize', v)}/><Range label="Espaciado" value={design.gap} min={0} max={110} onChange={v => set('gap', v)}/><Range label="Padding interno" value={design.padding} min={0} max={150} onChange={v => set('padding', v)}/></section>
      <section className="control-panel"><span className="eyebrow">06 / SUPERFICIE</span><h3>Fondo y sombra</h3><span className="control-label">Forma</span><div className="choice-grid two">{([['none','Transparente'],['circle','Circulo'],['square','Cuadrado suave'],['pill','Capsula']] as const).map(([v,label]) => <button key={v} className={design.background === v ? 'selected' : ''} onClick={() => set('background', v)}>{label}</button>)}</div>{design.background !== 'none' && <><ColorControl label="Color del fondo" value={design.bgColor} onChange={v => set('bgColor', v)}/><Range label="Opacidad" value={design.bgOpacity} min={0} max={100} unit="%" onChange={v => set('bgOpacity', v)}/>{design.background === 'square' && <Range label="Radio de esquina" value={design.radius} min={0} max={160} onChange={v => set('radius', v)}/>}</>}<label className="toggle-field"><span>Sombra disponible</span><input type="checkbox" checked={design.shadow} onChange={e => set('shadow', e.target.checked)}/></label><Range label="Desenfoque" value={design.shadowBlur} min={0} max={32} onChange={v => set('shadowBlur', v)}/><Range label="Distancia" value={design.shadowDistance} min={0} max={44} onChange={v => set('shadowDistance', v)}/><Range label="Angulo" value={design.shadowAngle} min={0} max={360} unit="°" onChange={v => set('shadowAngle', v)}/><Range label="Opacidad sombra" value={design.shadowOpacity} min={0} max={90} unit="%" onChange={v => set('shadowOpacity', v)}/><ColorControl label="Color de sombra" value={design.shadowColor} onChange={v => set('shadowColor', v)}/></section>
    </div>
    <aside className="preview-column" id="preview"><div className="preview-panel"><div className="preview-title"><span className="eyebrow">VISTA PREVIA EN VIVO</span><span className="live-indicator">● EN VIVO</span></div><div className="checker"><img src={preview} alt={`Vista previa de ${entry.name}`}/></div><div className="preview-foot"><span>PNG transparente</span><span>Ringbearer por defecto</span></div></div><div className="export-panel"><span className="eyebrow">EXPORTAR / PNG</span><h3>Listo para diseñar.</h3><div className="choice-grid three size-options">{[512,1024,2048].map(v => <button key={v} className={size === v ? 'selected' : ''} onClick={() => setSize(v)}>PNG {v}</button>)}</div><label className="toggle-field"><span>Recortar al contenido</span><input type="checkbox" checked={crop} onChange={e => setCrop(e.target.checked)}/></label><button className="primary-btn full-btn" disabled={busy} onClick={() => exportImage()}><Download size={18}/>{busy ? 'Preparando...' : 'Descargar PNG'}</button><button className="secondary-btn full-btn" disabled={busy} onClick={() => exportImage(true)}><Copy size={17}/> Copiar imagen</button><button className="secondary-btn full-btn" disabled={busy} onClick={() => exportImage(false, true)}><SendToBack size={17}/> Preparar para herramientas.fgdll.org</button><button className="secondary-btn full-btn" onClick={() => onToggleFavorite(iconKey)}><Heart size={17} fill={isFavorite ? 'currentColor' : 'none'}/>{isFavorite ? 'Quitar favorito' : 'Guardar favorito'}</button>{message && <p className="status-message" role="status">{message}</p>}</div></aside></div>
    <div className="mobile-action-bar"><a href="#preview" className="secondary-btn"><Eye size={17}/> Vista previa</a><button className="primary-btn" disabled={busy} onClick={() => exportImage()}><Download size={17}/> Descargar</button></div>
  </div>;
}
