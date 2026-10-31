/* Datos del juego: especies, equipo, cebos y economía */
window.G = window.G || {};

G.PXM = 4;            // píxeles de mundo por metro
G.WORLD = { w: 10400, h: 1900, shore: 1000, buoyM: 200, fenceL: 560, fenceR: 9900 };
G.BUOY_Y = G.WORLD.shore - G.WORLD.buoyM * G.PXM; // 200

G.RARITY = {
  comun:   { name: 'Común',       weight: 100, color: '#9fb8c8' },
  poco:    { name: 'Poco común',  weight: 40,  color: '#6fd08c' },
  raro:    { name: 'Raro',        weight: 14,  color: '#5aa9ff' },
  epico:   { name: 'Épico',       weight: 5,   color: '#c27bff' },
  leyenda: { name: 'Legendario',  weight: 1.5, color: '#ffb23e' },
};

/* id, nombre, científico, rareza, hábitats (A arena, R roca, P posidonia, O cualquiera),
   dmin, dmax (m desde orilla), hora, modos, dificultad, anzuelo mínimo,
   cm[min,max], kg[min,max], €/kg, forma, color, preferencia cebo [gusano,sardina,cangrejo], extras */
const S = (id, name, sci, rar, hab, dmin, dmax, time, modes, diff, hook, cm, kg, eurKg, shape, color, bait, o) =>
  ({ id, name, sci, rar, hab, dmin, dmax, time, modes, diff, hook, cm, kg, eurKg, shape, color, bait: bait || [1, 1, 1], ...(o || {}) });
const OP = ['orilla', 'paddle'], OPS = ['orilla', 'paddle', 'sub'];

G.SPECIES = [
  // ---- Comunes
  S('boqueron', 'Boquerón', 'Engraulis encrasicolus', 'comun', 'O', 3, 70, 'any', OP, 8, 0, [11, 19], [.02, .06], 90, 'fish', '#c8d4dc', [1.6, .6, .2], { light: 1 }),
  S('sardina', 'Sardina', 'Sardina pilchardus', 'comun', 'O', 15, 190, 'any', OP, 10, 0, [13, 22], [.04, .12], 55, 'fish', '#9fb4c8', [1.4, .9, .2], { light: 1 }),
  S('mojarra', 'Mojarra', 'Diplodus vulgaris', 'comun', 'RP', 0, 45, 'dia', OPS, 13, 0, [14, 28], [.08, .4], 32, 'fish', '#b9b19a', [1.5, .5, 1.3]),
  S('salmonete', 'Salmonete', 'Mullus surmuletus', 'comun', 'AP', 0, 50, 'dia', OP, 12, 0, [12, 28], [.06, .3], 48, 'fish', '#e46a5a', [1.7, .4, 1]),
  S('sargo', 'Sargo', 'Diplodus sargus', 'comun', 'RP', 0, 50, 'any', OPS, 16, 0, [18, 40], [.15, .9], 30, 'fish', '#9aa3a8', [1.2, .4, 1.6], { sw: 'high' }),
  S('boga', 'Boga', 'Boops boops', 'comun', 'PR', 0, 40, 'dia', OP, 12, 0, [15, 30], [.1, .45], 12, 'fish', '#c9c36a', [1.6, .5, .6]),
  S('salema', 'Salema', 'Sarpa salpa', 'comun', 'P', 0, 40, 'dia', OPS, 12, 0, [15, 32], [.1, .5], 14, 'fish', '#b6bf73', [1.4, .3, .8], { light: 1 }),
  S('chopa', 'Chopa', 'Spondyliosoma cantharus', 'comun', 'RA', 0, 30, 'dia', OP, 18, 0, [18, 40], [.2, 1.1], 18, 'fish', '#7f8a94', [1.4, .5, 1.2]),
  S('tordo', 'Tordo', 'Symphodus tinca', 'comun', 'RP', 0, 30, 'dia', OPS, 12, 0, [12, 25], [.05, .2], 14, 'fish', '#4aa18a', [1.5, .4, 1.3]),
  S('caballa', 'Caballa', 'Scomber colias', 'comun', 'O', 30, 190, 'dia', OP, 22, 1, [25, 45], [.2, 1], 16, 'tuna', '#4f86a8', [.3, 1.8, .2]),
  S('jurel', 'Jurel', 'Trachurus trachurus', 'comun', 'O', 35, 190, 'any', OP, 24, 1, [20, 50], [.15, 1.5], 14, 'fish', '#7b9aa6', [.3, 1.5, .5]),
  // ---- Poco comunes
  S('dorada', 'Dorada', 'Sparus aurata', 'poco', 'APR', 5, 85, 'any', OPS, 34, 2, [25, 60], [.4, 3.5], 24, 'fish', '#c9b28a', [.6, .8, 1.9], { sw: 'mid' }),
  S('lubina', 'Lubina', 'Dicentrarchus labrax', 'poco', 'RA', 3, 80, 'noche', OPS, 40, 2, [35, 90], [.6, 6], 30, 'fish', '#aab4b8', [.3, 2, 1], { sw: 'high' }),
  S('pagel', 'Pagel', 'Pagellus erythrinus', 'poco', 'AR', 20, 120, 'any', OPS, 32, 2, [25, 50], [.3, 2.5], 26, 'fish', '#e58d86', [.8, 1.3, 1.1]),
  S('lenguado', 'Lenguado', 'Solea solea', 'poco', 'A', 0, 60, 'noche', OP, 34, 1, [25, 50], [.2, 1.2], 42, 'flat', '#9b8466', [1.6, .4, 1.2]),
  S('sepia', 'Sepia', 'Sepia officinalis', 'poco', 'PA', 5, 60, 'noche', OPS, 32, 1, [15, 35], [.3, 1.8], 22, 'octo', '#b99a7c', [.2, 1.4, 1.7], { light: 1 }),
  S('calamar', 'Calamar', 'Loligo vulgaris', 'poco', 'O', 25, 150, 'noche', OP, 32, 1, [20, 50], [.2, 1.5], 26, 'octo', '#d9bfb3', [.2, 1.6, .8], { light: 1 }),
  S('pulpo', 'Pulpo', 'Octopus vulgaris', 'poco', 'RP', 0, 70, 'any', OPS, 36, 2, [30, 100], [1, 6], 16, 'octo', '#c06a4b', [.2, .8, 2.2], { sw: 'low' }),
  S('raya', 'Raya', 'Raja clavata', 'poco', 'A', 10, 110, 'any', OP, 38, 2, [40, 110], [1.5, 15], 7, 'flat', '#8a7a62', [.3, 1.4, 1.5]),
  S('arana', 'Araña', 'Trachinus draco', 'poco', 'A', 0, 30, 'dia', OP, 22, 0, [15, 35], [.1, .6], 22, 'fish', '#b7ab7c', [1.5, .8, .8]),
  S('cabracho', 'Cabracho', 'Scorpaena scrofa', 'poco', 'R', 15, 100, 'any', OPS, 40, 2, [20, 45], [.3, 1.8], 38, 'fish', '#b0412f', [.5, 1, 1.6]),
  S('rubio', 'Rubio', 'Chelidonichthys cuculus', 'poco', 'A', 20, 120, 'any', OP, 30, 1, [20, 45], [.2, 1.2], 20, 'fish', '#e0705a', [.8, 1.3, 1]),
  S('palometa', 'Palometa', 'Trachinotus ovatus', 'poco', 'O', 10, 100, 'dia', OP, 36, 2, [25, 55], [.4, 3], 26, 'fish', '#cfd5d9', [.5, 1.6, .8], { sw: 'high' }),
  S('gallo', 'Gallo de San Pedro', 'Zeus faber', 'poco', 'A', 40, 150, 'any', OP, 38, 2, [25, 60], [.5, 3], 36, 'round', '#a89a72', [.3, 1.5, 1.2]),
  S('cangrejo', 'Cangrejo moruno', 'Eriphia verrucosa', 'poco', 'R', 0, 20, 'noche', ['orilla'], 20, 0, [8, 14], [.1, .4], 26, 'crab', '#8c5a3c', [.6, 1.2, .2]),
  S('erizo', 'Erizo de mar', 'Paracentrotus lividus', 'poco', 'RP', 2, 30, 'dia', ['sub'], 10, 0, [5, 9], [.05, .15], 60, 'urchin', '#6a3f7a', [1, 1, 1]),
  // ---- Raros
  S('morena', 'Morena', 'Muraena helena', 'raro', 'R', 5, 50, 'noche', ['orilla', 'sub'], 55, 3, [60, 140], [1, 6], 14, 'long', '#6b5a2c', [.2, 1, 2]),
  S('congrio', 'Congrio', 'Conger conger', 'raro', 'RA', 20, 110, 'noche', ['orilla', 'sub'], 60, 3, [80, 200], [3, 18], 12, 'long', '#4b4f57', [.2, 1.6, 1.5]),
  S('denton', 'Dentón', 'Dentex dentex', 'raro', 'R', 30, 150, 'dia', OPS, 62, 3, [40, 100], [1.5, 10], 34, 'fish', '#8aa0b4', [.2, 1.8, 1]),
  S('corvina', 'Corvina', 'Argyrosomus regius', 'raro', 'RA', 30, 120, 'noche', OPS, 65, 3, [50, 120], [2, 20], 28, 'fish', '#8d8472', [.2, 1.8, 1]),
  S('barracuda', 'Barracuda', 'Sphyraena sphyraena', 'raro', 'O', 60, 190, 'dia', ['paddle'], 58, 3, [50, 120], [.8, 6], 30, 'long', '#8fa3ad', [0, 2, .2]),
  S('rape', 'Rape', 'Lophius piscatorius', 'raro', 'A', 90, 190, 'any', OP, 60, 3, [40, 120], [2, 20], 26, 'flat', '#6c5b4a', [.2, 1.6, 1.2]),
  S('bonito', 'Bonito', 'Sarda sarda', 'raro', 'O', 70, 190, 'dia', ['paddle'], 55, 3, [40, 70], [1, 5], 20, 'tuna', '#4a6f93', [0, 2, 0]),
  S('pargo', 'Pargo', 'Pagrus pagrus', 'raro', 'AR', 50, 150, 'any', OPS, 58, 3, [30, 70], [1, 6], 40, 'fish', '#d98a8a', [.4, 1.5, 1.3]),
  S('lampuga', 'Lampuga', 'Coryphaena hippurus', 'raro', 'O', 60, 190, 'dia', ['paddle'], 60, 3, [60, 120], [2, 15], 22, 'fish', '#e0c030', [0, 2, 0]),
  S('gamba', 'Gamba roja', 'Aristaeomorpha foliacea', 'raro', 'A', 100, 190, 'noche', OP, 45, 2, [10, 22], [.03, .12], 160, 'shrimp', '#d9453a', [0, 1.5, .8]),
  S('cigala', 'Cigala', 'Nephrops norvegicus', 'raro', 'A', 100, 190, 'noche', OP, 52, 3, [12, 25], [.08, .25], 110, 'shrimp', '#e07a52', [0, 1.2, 1.4]),
  S('loro', 'Pez loro', 'Sparisoma cretense', 'raro', 'R', 5, 40, 'dia', ['orilla', 'sub'], 50, 3, [20, 45], [.4, 2], 38, 'fish', '#d96b68', [.5, .8, 1.8]),
  // ---- Épicos
  S('mero', 'Mero', 'Epinephelus marginatus', 'epico', 'R', 20, 190, 'any', ['sub'], 85, 4, [70, 150], [8, 40], 46, 'fish', '#6b5d3f'),
  S('langosta', 'Langosta', 'Palinurus elephas', 'epico', 'R', 5, 60, 'noche', ['sub'], 70, 3, [25, 45], [.8, 3], 85, 'lobster', '#a8552d'),
  S('bogavante', 'Bogavante', 'Homarus gammarus', 'epico', 'R', 10, 90, 'noche', ['sub'], 72, 3, [30, 50], [1, 4], 90, 'lobster', '#32489a'),
  S('cherna', 'Cherna', 'Polyprion americanus', 'epico', 'R', 100, 190, 'any', ['sub'], 88, 4, [80, 160], [10, 50], 30, 'fish', '#6d6a60'),
  S('medregal', 'Medregal', 'Seriola dumerili', 'epico', 'O', 70, 190, 'dia', ['paddle', 'sub'], 80, 4, [80, 170], [10, 50], 20, 'tuna', '#a5a79e', [0, 2, 0]),
  S('atun', 'Atún rojo', 'Thunnus thynnus', 'epico', 'O', 130, 190, 'dia', ['paddle'], 92, 4, [100, 250], [30, 200], 14, 'tuna', '#2d4a7a', [0, 2, 0]),
  // ---- Legendarios
  S('mola', 'Pez luna', 'Mola mola', 'leyenda', 'O', 110, 190, 'dia', ['paddle'], 75, 4, [100, 250], [100, 500], 10, 'round', '#a9b4b8', [0, 1, 1]),
  S('marrajo', 'Marrajo', 'Isurus oxyrinchus', 'leyenda', 'O', 140, 190, 'noche', ['paddle'], 100, 5, [150, 300], [40, 150], 12, 'shark', '#5d7f9a', [0, 2, 0]),
  S('espada', 'Pez espada', 'Xiphias gladius', 'leyenda', 'O', 150, 190, 'dia', ['paddle'], 105, 5, [150, 350], [50, 250], 20, 'sword', '#4f6f8f', [0, 2, 0]),
];
G.SPECIES_BY_ID = Object.fromEntries(G.SPECIES.map(s => [s.id, s]));

G.HAB_NAMES = { A: 'Arena', R: 'Roca', P: 'Posidonia' };

/* Equipo: pts = puntos que suma a tu "puntuación de equipo" */
G.RODS = [
  { id: 'r0', name: 'Caña de bambú', reach: 28, pts: 4, price: 0 },
  { id: 'r1', name: 'Telescópica', reach: 45, pts: 8, price: 70 },
  { id: 'r2', name: 'Spinning ligera', reach: 65, pts: 14, price: 220 },
  { id: 'r3', name: 'Surfcasting 4,2 m', reach: 100, pts: 22, price: 650 },
  { id: 'r4', name: 'Surfcasting Pro', reach: 145, pts: 32, price: 1700 },
  { id: 'r5', name: 'Carbono Élite', reach: 190, pts: 45, price: 4200 },
];
G.LINES = [
  { id: 'l0', name: 'Nylon 0,18', pts: 3, price: 0, tension: 1.25 },
  { id: 'l1', name: 'Nylon 0,28', pts: 7, price: 40, tension: 1.05 },
  { id: 'l2', name: 'Fluorocarbono 0,35', pts: 13, price: 140, tension: 0.9 },
  { id: 'l3', name: 'Trenzado 0,25', pts: 20, price: 480, tension: 0.75 },
  { id: 'l4', name: 'Trenzado 0,40', pts: 30, price: 1300, tension: 0.6 },
  { id: 'l5', name: 'Trenzado marino', pts: 42, price: 3300, tension: 0.48 },
];
G.HOOKS = [
  { id: 'h0', name: 'Anzuelo nº 12', pts: 3, price: 0, tier: 0 },
  { id: 'h1', name: 'Anzuelo nº 9', pts: 6, price: 25, tier: 1 },
  { id: 'h2', name: 'Anzuelo nº 6', pts: 10, price: 90, tier: 2 },
  { id: 'h3', name: 'Anzuelo nº 4', pts: 16, price: 300, tier: 3 },
  { id: 'h4', name: 'Anzuelo nº 2', pts: 24, price: 900, tier: 4 },
  { id: 'h5', name: 'Anzuelo nº 1', pts: 34, price: 2200, tier: 5 },
];
G.BAITS = [
  { id: 'gusano', name: 'Gusanos', pts: 2, price: 1.25, pack20: 22, icon: '🪱', ico: 'worm', tier: 1, wait: 1.55, maxRar: 1, desc: 'Baratos, pero tardan en picar y solo atraen peces comunes y poco comunes.' },
  { id: 'sardina', name: 'Sardinas', pts: 3, price: 4, pack20: 70, icon: '🐟', ico: 'sardine', tier: 2, wait: 1.0, maxRar: 3, desc: 'Calidad media: picada normal, peces comunes y raros, y alguno épico.' },
  { id: 'cangrejo', name: 'Cangrejos', pts: 5, price: 10, pack20: 190, icon: '🦀', ico: 'crab', tier: 3, wait: 0.62, maxRar: 4, desc: 'Los mejores: pican enseguida y atraen a todas las especies.' },
];
G.BAITS.push({ id: 'gusano_ini', name: 'Gusanos de aprendiz', pts: 2, icon: '🪱', ico: 'worm', tier: 1, wait: 1.55, maxRar: 1, starter: true, desc: 'Regalo de inicio: no caducan y no se pueden vender.' });
G.RAR_ORDER = ['comun', 'poco', 'raro', 'epico', 'leyenda'];
G.BAIT_INDEX = { gusano_ini: 0, gusano: 0, sardina: 1, cangrejo: 2 };

/* Buceo */
G.SPEARS = [
  { id: 's0', name: 'Arpón de banda 40', pts: 8, range: 3, price: 200 },
  { id: 's1', name: 'Arpón de banda 60', pts: 14, range: 4, price: 420 },
  { id: 's2', name: 'Arpón de banda 90', pts: 22, range: 5.5, price: 1100 },
  { id: 's3', name: 'Arpón Pro 120', pts: 34, range: 7, price: 2800 },
];
G.DIVE_GEAR = [
  { id: 'gafas', name: 'Gafas de bucear', price: 45, icon: '🥽', ico: 'mask' },
  { id: 'aletas', name: 'Aletas', price: 90, icon: '🦶', ico: 'fin' },
  { id: 'neopreno', name: 'Neopreno', price: 150, icon: '🤿', ico: 'wetsuit' },
];
G.EXTRAS = [
  { id: 'lampara', name: 'Lámpara de pesca', price: 160, icon: '🔦', ico: 'lamp', desc: 'De noche es tu única luz fuerte: ilumina el agua, deja ver los bancos y atrae calamares y sepias. +3 puntos.' },
  { id: 'paddle', name: 'Tabla de paddle surf', price: 900, icon: '🏄', ico: 'board', desc: 'Recorre toda la costa hasta las boyas de 200 m y pesca desde la tabla.' },
];

/* Economía */
G.SHOP_LEVELS = [
  { name: 'Puesto con cajas', mult: 0.50, cost: 0 },
  { name: 'Toldo y báscula', mult: 0.62, cost: 150 },
  { name: 'Cámara frigorífica', mult: 0.78, cost: 500 },
  { name: 'Vitrina con hielo', mult: 0.96, cost: 1400 },
  { name: 'Cartel de neón', mult: 1.18, cost: 3500 },
  { name: 'Pescadería gourmet', mult: 1.45, cost: 8000 },
];
/* Códigos de regalo (canjeables una sola vez por partida, desde Ajustes) */
G.GIFT_CODES = { DORADA: { money: 1000 }, CALUM: { money: 1000 } };
G.SUPPLIER_MULT = 0.9;
G.SELL_BACK = 0.5;   // al revender equipo te dan la mitad de lo que costó
/* Neveras: capacidad y % de frescura que pierde cada pez por hora de juego */
G.COOLERS = [
  { id: 'c0', name: 'Nevera de playa', cap: 3, loss: 6, price: 0 },
  { id: 'c1', name: 'Nevera portátil', cap: 5, loss: 4.5, price: 60 },
  { id: 'c2', name: 'Nevera con hielo', cap: 10, loss: 3, price: 220 },
  { id: 'c3', name: 'Nevera grande', cap: 20, loss: 2, price: 700 },
  { id: 'c4', name: 'Nevera industrial', cap: 40, loss: 1.2, price: 2200 },
  { id: 'c5', name: 'Arcón frigorífico', cap: 80, loss: 0.6, price: 6500 },
  { id: 'c6', name: 'Nevera Criogénica', cap: 120, loss: 0.3, gems: 30 },
  { id: 'c7', name: 'Nevera Abisal', cap: 250, loss: 0.1, gems: 75 },
];
G.MILESTONES = { 10: 100, 20: 400, 30: 1000, 40: 2500, 47: 10000 };
G.SWELL_NAMES = ['Calma', 'Marejadilla', 'Marejada', 'Temporal'];
