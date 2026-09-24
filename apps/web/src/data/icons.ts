import { Award, BookOpen, CalendarDays, CircleAlert, Clock3, Compass, Gem, GraduationCap, HandHeart, HeartHandshake, LockKeyhole, MapPin, Megaphone, MessageCircle, ScrollText, Shield, Sparkles, Star, Sunrise, UsersRound, type LucideIcon } from 'lucide-react';

export type Category = 'Eventos' | 'Comunidad' | 'Formación' | 'Institucional';
export type IconEntry = { key: string; name: string; category: Category; Icon: LucideIcon };

export const icons: IconEntry[] = [
  { key: 'fecha', name: 'Fecha', category: 'Eventos', Icon: CalendarDays },
  { key: 'hora', name: 'Hora', category: 'Eventos', Icon: Clock3 },
  { key: 'ubicacion', name: 'Ubicación', category: 'Eventos', Icon: MapPin },
  { key: 'informes', name: 'Informes', category: 'Eventos', Icon: MessageCircle },
  { key: 'comunidad', name: 'Comunidad', category: 'Comunidad', Icon: UsersRound },
  { key: 'acompanamiento', name: 'Acompañamiento', category: 'Comunidad', Icon: HeartHandshake },
  { key: 'servicio', name: 'Servicio', category: 'Comunidad', Icon: HandHeart },
  { key: 'esperanza', name: 'Esperanza', category: 'Comunidad', Icon: Sunrise },
  { key: 'formacion', name: 'Formación', category: 'Formación', Icon: GraduationCap },
  { key: 'reconocimiento', name: 'Reconocimiento', category: 'Formación', Icon: Award },
  { key: 'reflexion', name: 'Reflexión', category: 'Formación', Icon: BookOpen },
  { key: 'proposito', name: 'Propósito', category: 'Formación', Icon: Compass },
  { key: 'reglamento', name: 'Reglamento', category: 'Institucional', Icon: ScrollText },
  { key: 'confidencialidad', name: 'Confidencialidad', category: 'Institucional', Icon: LockKeyhole },
  { key: 'aviso', name: 'Aviso', category: 'Institucional', Icon: Megaphone },
  { key: 'importante', name: 'Importante', category: 'Institucional', Icon: CircleAlert },
];

export type Profile = { id: string; name: string; zone: string; center: string; city: string; address: string; days: string; time: string; whatsapp: string; motto: string; colors: string; notes: string; shortText: string };
export const blankProfile = (): Profile => ({ id: crypto.randomUUID(), name: '', zone: '', center: '', city: '', address: '', days: '', time: '', whatsapp: '', motto: '', colors: '#E9BD76, #142B43', notes: '', shortText: '' });
export function profileValue(key: string, profile?: Profile | null) {
  if (!profile) return ({ fecha: 'Sábado 17 de mayo', hora: '18:00 h', ubicacion: 'Centro comunitario · Ciudad', informes: '+00 000 000 000' } as Record<string, string>)[key] || '';
  if (key === 'fecha') return profile.days || 'Día por definir';
  if (key === 'hora') return profile.time || 'Hora por definir';
  if (key === 'ubicacion') return [profile.address, profile.city].filter(Boolean).join(' · ') || 'Lugar por definir';
  if (key === 'informes') return profile.whatsapp || 'Contacto por definir';
  return profile.shortText || profile.motto || '';
}

export type VisibilityState = 'visible' | 'archived';
export type AdminSection = { id: string; name: string; description: string; visible: boolean; order: number; status: VisibilityState };
export type AdminResource = { id: string; name: string; kind: 'escudo' | 'medallon' | 'marco' | 'sello' | 'cinta' | 'fondo' | 'simbolo'; sectionId: string; description: string; tags: string; symbol: 'shield' | 'star' | 'sparkles' | 'gem' | 'sunrise'; order: number; status: VisibilityState };
export type AdminFont = { id: string; name: string; use: string; defaultForGroupName: boolean; visible: boolean; order: number; status: VisibilityState };
export type AdminIdea = { id: string; title: string; description: string; category: Category | 'Logotipos'; tags: string; suggestedResources: string; order: number; status: VisibilityState };
export type HelpMessageStatus = 'pendiente' | 'revisado' | 'respondido' | 'archivado';
export type HelpMessage = { id: string; name: string; group: string; contact: string; type: 'duda' | 'propuesta' | 'error' | 'idea'; message: string; status: HelpMessageStatus; createdAt: string };

export type AdminStore = { sections: AdminSection[]; resources: AdminResource[]; fonts: AdminFont[]; ideas: AdminIdea[]; helpMessages: HelpMessage[] };

export const resourceIcons: Record<AdminResource['symbol'], LucideIcon> = { shield: Shield, star: Star, sparkles: Sparkles, gem: Gem, sunrise: Sunrise };

export const defaultAdminStore = (): AdminStore => {
  const sections: AdminSection[] = [
    { id: 'loguitos', name: 'Loguitos / recursos base', description: 'Escudos, medallones, marcos, sellos, cintas y fondos para logotipos.', visible: true, order: 1, status: 'visible' },
    { id: 'institucional', name: 'Institucional', description: 'Recursos sobrios para comunicación oficial.', visible: true, order: 2, status: 'visible' },
    { id: 'ideas', name: 'Ideas de iconos', description: 'Propuestas listas para convertir en nuevos recursos.', visible: true, order: 3, status: 'visible' },
  ];
  return {
    sections,
    resources: [
      { id: 'escudo-luz', name: 'Escudo de luz', kind: 'escudo', sectionId: 'loguitos', description: 'Base tipo escudo para grupos.', tags: 'escudo, grupo, logotipo', symbol: 'shield', order: 1, status: 'visible' },
      { id: 'medallon-dorado', name: 'Medallon dorado', kind: 'medallon', sectionId: 'loguitos', description: 'Medallon circular para insignias.', tags: 'medallon, sello, circular', symbol: 'gem', order: 2, status: 'visible' },
      { id: 'sello-servicio', name: 'Sello de servicio', kind: 'sello', sectionId: 'institucional', description: 'Sello simple para materiales oficiales.', tags: 'sello, servicio', symbol: 'star', order: 3, status: 'visible' },
    ],
    fonts: [
      { id: 'ringbearer', name: 'Ringbearer', use: 'Nombre del grupo y logotipos principales.', defaultForGroupName: true, visible: true, order: 1, status: 'visible' },
      { id: 'outfit', name: 'Outfit', use: 'Interfaz, datos secundarios y textos compactos.', defaultForGroupName: false, visible: true, order: 2, status: 'visible' },
      { id: 'manrope', name: 'Manrope', use: 'Lectura general y formularios.', defaultForGroupName: false, visible: true, order: 3, status: 'visible' },
    ],
    ideas: [
      { id: 'icono-bienvenida', title: 'Bienvenida', description: 'Icono para recibir nuevos integrantes.', category: 'Comunidad', tags: 'bienvenida, comunidad', suggestedResources: 'Escudo de luz', order: 1, status: 'visible' },
      { id: 'logo-grupo', title: 'Logotipo circular de grupo', description: 'Composicion con medallon, nombre del grupo y lema.', category: 'Logotipos', tags: 'logotipo, medallon', suggestedResources: 'Medallon dorado', order: 2, status: 'visible' },
    ],
    helpMessages: [],
  };
};
