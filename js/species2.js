/* Más especies del Mediterráneo y descripciones de todas */
window.G = window.G || {};

(function () {
  const OP = ['orilla', 'paddle'], OPS = ['orilla', 'paddle', 'sub'], OS = ['orilla', 'sub'];
  const S = (id, name, sci, rar, hab, dmin, dmax, time, modes, diff, hook, cm, kg, eurKg, shape, color, bait, o) =>
    ({ id, name, sci, rar, hab, dmin, dmax, time, modes, diff, hook, cm, kg, eurKg, shape, color, bait: bait || [1, 1, 1], ...(o || {}) });

  const NEW = [
    // ---- Comunes
    S('liza', 'Lisa', 'Mugil cephalus', 'comun', 'O', 0, 25, 'dia', OP, 14, 0, [25, 60], [.3, 3], 7, 'fish', '#a7b1b6', [1.6, .4, .5], { pat: 'hlines', desc: 'Nada en bancos cerca de puertos y desembocaduras. Es famosa por lo difícil que es engañarla, y salta fuera del agua con facilidad.' }),
    S('mabre', 'Mabre', 'Spicara maena', 'comun', 'PA', 10, 90, 'dia', OP, 12, 0, [14, 24], [.05, .2], 9, 'fish', '#d6a86a', [1.5, .6, .3], { pat: 'spot', desc: 'Los machos se visten de colores azulados y construyen nidos en la época de cría. Muy abundante sobre las praderas de posidonia.' }),
    S('oblada', 'Oblada', 'Oblada melanura', 'comun', 'RP', 0, 30, 'dia', OPS, 13, 0, [15, 30], [.1, .45], 11, 'fish', '#7d8d96', [1.6, .5, .5], { pat: 'band', desc: 'Se reconoce por la mancha negra justo antes de la cola. Se acerca a la orilla siguiendo restos de cebo suelto.' }),
    S('doncella', 'Doncella', 'Coris julis', 'comun', 'R', 0, 30, 'dia', OS, 9, 0, [10, 20], [.02, .08], 6, 'fish', '#e8863a', [1.6, .3, 1], { pat: 'hlines', desc: 'Naranja y azul brillante: nace hembra y muchas se vuelven macho con los años. Muy habitual entre las rocas poco profundas.' }),
    S('castanuela', 'Castañuela', 'Chromis chromis', 'comun', 'R', 3, 40, 'dia', OS, 8, 0, [8, 14], [.01, .04], 3, 'fish', '#4a4f66', [1.6, .5, .4], { desc: 'Pececillo oscuro que forma nubes sobre las rocas. Los juveniles son de un azul eléctrico precioso.' }),
    S('cabrilla', 'Cabrilla', 'Serranus cabrilla', 'comun', 'RP', 5, 70, 'any', OPS, 14, 0, [12, 28], [.05, .35], 18, 'fish', '#d9763a', [1.2, .5, 1.5], { pat: 'stripes', desc: 'Es hermafrodita: cada individuo puede actuar como macho y como hembra. Pariente pequeño de los meros.' }),
    S('gobio', 'Gobio negro', 'Gobius niger', 'comun', 'A', 0, 20, 'any', OP, 8, 0, [8, 16], [.01, .06], 4, 'fish', '#4a3f35', [2, .2, .5], { desc: 'Pequeño habitante de fondos arenosos que vigila su territorio. Pica con cualquier cosa que le pongas.' }),
    S('pejerrey', 'Pejerrey', 'Atherina presbyter', 'comun', 'O', 0, 15, 'dia', OP, 8, 0, [9, 15], [.01, .03], 6, 'fish', '#cfdde2', [1.5, .8, .1], { pat: 'hlines', light: 1, desc: 'Banco plateado con una línea brillante en el costado. Alimento de muchos depredadores costeros.' }),
    S('acedia', 'Acedía', 'Dicologlossa cuneata', 'comun', 'A', 3, 80, 'noche', OP, 13, 0, [15, 25], [.06, .2], 15, 'flat', '#a89878', [1.6, .5, .7], { desc: 'Un pequeño lenguado de arena que sale de noche a comer gusanos. Muy buscado para las frituras.' }),
    S('salmonete_fango', 'Salmonete de fango', 'Mullus barbatus', 'comun', 'A', 10, 90, 'dia', OP, 13, 0, [12, 24], [.05, .2], 22, 'fish', '#f08a78', [1.7, .4, 1], { desc: 'Más rosado y de cabeza más redondeada que el de roca. Hurga en el fango con sus barbillones sensibles.' }),
    S('aligote', 'Aligote', 'Pagellus acarne', 'comun', 'AR', 15, 120, 'any', OP, 14, 0, [18, 32], [.1, .5], 12, 'fish', '#d49c86', [1, 1.2, .9], { pat: 'spot', desc: 'Pariente del pagel con una mancha oscura en la base de la aleta pectoral. Vive en bancos cerca del fondo.' }),
    S('caramel', 'Caramel', 'Spicara smaris', 'comun', 'PA', 10, 100, 'dia', OP, 11, 0, [12, 18], [.03, .1], 8, 'fish', '#e6d0a0', [1.4, .8, .4], { pat: 'spot', desc: 'Pequeño y plateado, con una mancha oscura en el costado. Forma enormes bancos y se vende en las freidurías.' }),
    S('camaron', 'Camarón', 'Palaemon serratus', 'comun', 'P', 0, 15, 'noche', ['orilla'], 8, 0, [4, 10], [.005, .02], 55, 'shrimp', '#cfc0b0', [1.8, .3, .3], { desc: 'Casi transparente de día, sale de noche entre las praderas de posidonia. Se esconde en los charcos de las rocas.' }),
    S('alacha', 'Alacha', 'Sardinella aurita', 'comun', 'O', 10, 120, 'dia', OP, 10, 0, [18, 30], [.06, .2], 10, 'fish', '#8cb0a8', [1.2, 1.1, .2], { pat: 'hlines', desc: 'Se parece a la sardina, pero con una banda dorada; sube hacia nuestras costas con las aguas cálidas.' }),
    S('arana_menor', 'Araña menor', 'Echiichthys vipera', 'comun', 'A', 0, 12, 'dia', OP, 12, 0, [8, 14], [.02, .05], 10, 'fish', '#bdae88', [1.5, .7, .7], { desc: '¡Cuidado! Más pequeña que la araña, pero igual de venenosa: sus espinas negras dan un dolor muy fuerte. Se entierra en la arena de la orilla.' }),
    S('raspallon', 'Raspallón', 'Diplodus annularis', 'comun', 'PR', 0, 30, 'dia', OPS, 12, 0, [12, 22], [.04, .2], 12, 'fish', '#a8a884', [1.6, .5, 1], { pat: 'band', desc: 'El más pequeño de los sargos, con una mancha negra anular en la cola. Muy habitual en las praderas de posidonia.' }),
    // ---- Poco comunes
    S('sargo_picudo', 'Sargo picudo', 'Diplodus puntazzo', 'poco', 'R', 0, 40, 'dia', OPS, 30, 1, [25, 50], [.3, 1.5], 25, 'fish', '#9ca3a6', [1.2, .4, 1.5], { pat: 'stripes', desc: 'De hocico alargado y puntiagudo, perfecto para arrancar mejillones de las rocas. Muy esquivo.' }),
    S('sargo_breado', 'Sargo breado', 'Diplodus cervinus', 'poco', 'R', 10, 80, 'any', OPS, 34, 1, [30, 60], [.5, 2.5], 28, 'fish', '#a9a89c', [1.2, .4, 1.5], { pat: 'stripes', desc: 'Con franjas anchas que lo hacen inconfundible, es de los grandes sargos. Prefiere rocas más profundas.' }),
    S('maragota', 'Maragota', 'Labrus bergylta', 'poco', 'R', 2, 40, 'dia', OPS, 30, 1, [25, 50], [.3, 2], 18, 'fish', '#7c8f58', [1.4, .4, 1.6], { pat: 'spots', desc: 'Gran lábrido que cambia de color con la edad. Todas nacen hembras y algunas se vuelven machos.' }),
    S('merlo', 'Merlo', 'Labrus merula', 'poco', 'R', 3, 40, 'dia', OPS, 28, 1, [20, 40], [.2, 1.2], 16, 'fish', '#44566a', [1.4, .4, 1.5], { desc: 'Azul casi negro y muy territorial. Se mueve despacio entre las grietas de las rocas.' }),
    S('rascacio', 'Rascacio', 'Scorpaena porcus', 'poco', 'R', 0, 40, 'noche', OPS, 30, 1, [12, 25], [.05, .4], 20, 'fish', '#7c4a34', [.8, .8, 1.5], { pat: 'spots', desc: 'Primo pequeño del cabracho. Se camufla entre las rocas y sus espinas venenosas duelen muchísimo: no lo toques.' }),
    S('corvallo', 'Corvallo', 'Sciaena umbra', 'poco', 'R', 5, 40, 'noche', OPS, 32, 1, [25, 50], [.3, 2], 40, 'fish', '#5a4a3e', [.8, 1.2, 1.6], { desc: 'Oscuro y de aletas orladas de blanco. Se esconde en cuevas durante el día y emite gruñidos con su cuerpo.' }),
    S('roncador', 'Roncador', 'Pomadasys incisus', 'poco', 'A', 5, 60, 'noche', OP, 30, 1, [18, 40], [.2, 1.2], 14, 'fish', '#b0b0a0', [1.4, .8, 1], { desc: 'Cuando lo sacas del agua gruñe frotando los dientes de la garganta. Ronca como un cerdo: de ahí su nombre.' }),
    S('ballesta', 'Pez ballesta', 'Balistes capriscus', 'poco', 'O', 10, 80, 'dia', OP, 32, 2, [25, 45], [.5, 2], 18, 'fish', '#8a9a9a', [1.3, .8, 1.2], { desc: 'Puede erguir una espina de la aleta dorsal como un cerrojo para incrustarse en las grietas. Su piel es dura como una coraza.' }),
    S('globo', 'Pez globo plateado', 'Lagocephalus sceleratus', 'poco', 'PR', 3, 50, 'noche', OP, 28, 1, [20, 70], [.3, 6], 2, 'round', '#c2c8b0', [1.2, 1, 1], { pat: 'spots', desc: 'Invasor llegado desde el mar Rojo. Contiene tetrodotoxina, un veneno mortal que no se destruye al cocinar: no se come. Sus mordiscos cortan el sedal.' }),
    S('anguila', 'Anguila', 'Anguilla anguilla', 'poco', 'A', 0, 10, 'noche', OP, 34, 1, [40, 100], [.2, 2.5], 20, 'long', '#4c5a4a', [2, .3, .9], { desc: 'Nace en el mar de los Sargazos y viaja miles de kilómetros hasta nuestras costas. Está en peligro crítico de extinción.' }),
    S('anjova', 'Anjova', 'Pomatomus saltatrix', 'poco', 'O', 10, 100, 'dia', OP, 36, 2, [30, 80], [.5, 6], 16, 'tuna', '#7a8f9a', [0, 2, .5], { desc: 'Voraz depredador que ataca en grupo, persiguiendo bancos hasta la orilla. Sus dientes cortan sedales sin esfuerzo.' }),
    S('pulpo_blanco', 'Pulpo blanco', 'Eledone cirrhosa', 'poco', 'A', 20, 110, 'noche', OP, 30, 1, [15, 35], [.2, 1], 12, 'octo', '#d8c6b0', [.4, .8, 1.6], { desc: 'Pulpo con una sola hilera de ventosas en cada tentáculo. Más pequeño que el común, vive en fondos de arena.' }),
    S('rata', 'Rata', 'Uranoscopus scaber', 'poco', 'A', 15, 120, 'any', OP, 30, 1, [15, 30], [.1, .5], 14, 'fish', '#8a7a60', [1, 1, 1], { desc: 'Con los ojos en lo alto de la cabeza, se entierra en la arena y espera. Tiene espinas venenosas tras las agallas: cuidado al desanzuelarla.' }),
    S('pastinaca', 'Pastinaca', 'Dasyatis pastinaca', 'poco', 'A', 3, 60, 'any', OP, 38, 2, [40, 100], [1, 8], 4, 'ray', '#8e8068', [.5, 1.2, 1.4], { desc: 'Su aguijón en la cola es venenoso y causa heridas muy graves. Se esconde semienterrada en la arena de playas poco profundas.' }),
    S('langostino', 'Langostino', 'Penaeus kerathurus', 'poco', 'A', 5, 40, 'noche', OP, 24, 1, [10, 20], [.03, .1], 70, 'shrimp', '#d6b8a2', [1, .8, 1.3], { desc: 'Crustáceo rayado de fondos arenosos que escapa nadando hacia atrás. Muy apreciado en la cocina.' }),
    S('necora', 'Nécora', 'Necora puber', 'poco', 'R', 0, 30, 'noche', OS, 20, 0, [6, 10], [.08, .25], 30, 'crab', '#8a3a3a', [.6, 1.2, .8], { desc: 'Cangrejo de ojos rojos brillantes y pinzas aterciopeladas, muy agresivo para su tamaño.' }),
    S('cangrejo_azul', 'Cangrejo azul', 'Callinectes sapidus', 'poco', 'AP', 0, 20, 'noche', ['orilla'], 22, 0, [10, 20], [.1, .5], 12, 'crab', '#3a78b0', [.8, 1.2, 1], { desc: 'Invasor llegado de América en los lastres de los barcos. Devora almejas y peces pequeños y tiene un mal carácter.' }),
    S('pintarroja', 'Pintarroja', 'Scyliorhinus canicula', 'poco', 'A', 20, 190, 'noche', OP, 34, 2, [30, 70], [.4, 1.5], 6, 'shark', '#a6957a', [.5, 1.4, 1], { pat: 'spots', desc: 'Pequeño tiburón de arena y manchas. Sus huevos son bolsas con zarcillos que los marineros llaman «monederos de sirena».' }),
    S('bacaladilla', 'Bacaladilla', 'Micromesistius poutassou', 'poco', 'A', 100, 190, 'any', OP, 30, 1, [20, 35], [.1, .4], 6, 'fish', '#8aa0a8', [.6, 1.4, .8], { desc: 'Pariente pequeño del bacalao que vive en aguas más frescas y profundas. Forma grandes bancos cerca del fondo.' }),
    S('pejeperro', 'Pejeperro', 'Bodianus scrofa', 'poco', 'R', 15, 70, 'dia', OPS, 40, 2, [20, 45], [.4, 2.5], 26, 'fish', '#d8683c', [.6, .8, 1.7], { desc: 'Rojizo y llamativo; los machos tienen la frente abultada y nacen hembras. Es de los lábridos más grandes del Mediterráneo.' }),
    S('verrugato', 'Verrugato', 'Umbrina cirrosa', 'poco', 'A', 3, 60, 'noche', OP, 34, 2, [30, 80], [.5, 6], 28, 'fish', '#a8a898', [1.2, .8, 1.3], { pat: 'hlines', desc: 'Lleva un barbillón bajo la barbilla con el que rebusca en la arena. Merodea en las rompientes por la noche.' }),
    S('aguja', 'Aguja', 'Belone belone', 'poco', 'O', 5, 80, 'dia', OP, 28, 1, [40, 90], [.2, 1.2], 8, 'long', '#7fb0a0', [.3, 1.6, .2], { desc: 'Larga y de pico afilado, salta fuera del agua al sentirse atrapada. Sus espinas son verdes: es normal, no está en mal estado.' }),
    // ---- Raros
    S('besugo', 'Besugo', 'Pagellus bogaraveo', 'raro', 'R', 80, 190, 'any', OP, 52, 3, [30, 60], [.8, 3.5], 40, 'fish', '#d28a8a', [.4, 1.5, 1.2], { pat: 'spot', desc: 'Con un lunar negro en el hombro, es el plato navideño por excelencia en muchas casas.' }),
    S('rodaballo', 'Rodaballo', 'Scophthalmus maximus', 'raro', 'A', 10, 100, 'noche', OP, 58, 3, [40, 90], [1.5, 10], 38, 'flat', '#9a8660', [.4, 1.4, 1.2], { desc: 'Gran pez plano de ojos a la izquierda, con tubérculos óseos en la piel. Muy buscado por los gourmets.' }),
    S('sama', 'Sama', 'Dentex gibbosus', 'raro', 'R', 40, 150, 'dia', OP, 55, 3, [35, 70], [.8, 4], 40, 'fish', '#d77a96', [.4, 1.5, 1.2], { desc: 'Con una joroba en la frente que crece con la edad. Pariente rosado del dentón.' }),
    S('merluza', 'Merluza', 'Merluccius merluccius', 'raro', 'A', 100, 190, 'noche', OP, 55, 3, [30, 90], [.5, 6], 18, 'fish', '#9aa6aa', [.3, 1.6, .7], { desc: 'Alargada y dentuda: de día se refugia en el fondo y de noche sube a cazar. Una de las reinas de la cocina española.' }),
    S('gallineta', 'Gallineta', 'Helicolenus dactylopterus', 'raro', 'RA', 100, 190, 'any', OP, 55, 3, [20, 45], [.3, 1.5], 30, 'fish', '#d0583e', [.4, 1.5, 1.2], { pat: 'spots', desc: 'De tonos rojos y espinas venenosas, vive pegada a los fondos rocosos profundos.' }),
    S('volador', 'Pez volador', 'Cheilopogon heterurus', 'raro', 'O', 60, 190, 'dia', ['paddle'], 45, 2, [25, 40], [.2, .6], 10, 'fish', '#4c7aa0', [0, 1.5, .3], { desc: 'Salta fuera del agua para huir de los depredadores y planea con sus aletas enormes decenas de metros.' }),
    S('bacoreta', 'Bacoreta', 'Euthynnus alletteratus', 'raro', 'O', 60, 190, 'dia', ['paddle'], 58, 3, [45, 80], [2, 8], 12, 'tuna', '#4a6a8a', [0, 2, 0], { pat: 'spots', desc: 'Atún pequeño con manchas oscuras bajo la aleta pectoral. Ataca bancos de sardinas en la superficie con una velocidad enorme.' }),
    S('palometon', 'Palometón', 'Lichia amia', 'raro', 'O', 20, 190, 'dia', OP, 62, 3, [60, 150], [3, 30], 18, 'fish', '#a8b2b6', [0, 2, .5], { desc: 'Gran depredador plateado de cuerpo alto. Sus ataques en la superficie son explosivos y espectaculares.' }),
    S('tembladera', 'Tembladera', 'Torpedo marmorata', 'raro', 'A', 10, 100, 'noche', OP, 55, 3, [30, 60], [1, 6], 4, 'ray', '#7a6a5a', [.4, 1.4, 1.2], { pat: 'spots', desc: '¡Da descargas eléctricas para aturdir a sus presas! Si la pescas, no la agarres con las manos desnudas.' }),
    S('aguila', 'Águila de mar', 'Myliobatis aquila', 'raro', 'A', 20, 190, 'dia', OP, 58, 3, [50, 120], [3, 20], 5, 'ray', '#5a6a7a', [0, 1.6, 1.2], { desc: 'Con alas en forma de águila y una cola con aguijón. A veces salta fuera del agua.' }),
    S('centollo', 'Centollo', 'Maja squinado', 'raro', 'R', 5, 80, 'noche', OS, 50, 2, [12, 20], [.8, 2.5], 55, 'crab', '#b04a38', [.4, 1.4, 1.4], { desc: 'Caparazón espinoso que decora con algas y esponjas para camuflarse. Los adultos viajan en grandes grupos.' }),
    S('buey', 'Buey de mar', 'Cancer pagurus', 'raro', 'R', 10, 100, 'noche', OS, 52, 3, [15, 28], [.8, 3], 38, 'crab', '#b8643a', [.4, 1.4, 1.5], { desc: 'Cangrejo de caparazón ancho y pinzas negras con punta, muy valorado en las mariscadas.' }),
    S('cigarra', 'Cigarra de mar', 'Scyllarus arctus', 'raro', 'R', 5, 60, 'noche', ['sub'], 55, 3, [8, 16], [.05, .2], 120, 'lobster', '#9a6a4a', [1, 1, 1], { desc: 'Primo plano de la langosta, con antenas aplanadas como palas. Se esconde entre las rocas y sale de noche.' }),
    S('pota', 'Pota', 'Todarodes sagittatus', 'raro', 'O', 60, 190, 'noche', OP, 52, 2, [30, 60], [.4, 2], 12, 'octo', '#d8a898', [.2, 1.6, .8], { light: 1, desc: 'Calamar de mar abierto, muy ágil, que puede impulsarse fuera del agua con su chorro.' }),
    S('mielga', 'Mielga', 'Squalus acanthias', 'raro', 'A', 40, 190, 'any', OP, 60, 3, [60, 110], [2, 8], 7, 'shark', '#6a7a82', [.2, 1.6, .8], { desc: 'Pequeño tiburón con una espina venenosa delante de cada aleta dorsal. Muy longeva: puede vivir décadas.' }),
    S('cazon', 'Cazón', 'Galeorhinus galeus', 'raro', 'O', 30, 190, 'noche', OP, 60, 4, [90, 160], [8, 30], 9, 'shark', '#7a8a92', [.2, 1.6, .6], { desc: 'Tiburón costero y discreto, de hocico alargado. El cazón en adobo es plato típico de Andalucía.' }),
    S('lamprea', 'Lamprea marina', 'Petromyzon marinus', 'raro', 'A', 5, 60, 'noche', OP, 55, 3, [60, 120], [.5, 2.5], 28, 'long', '#5a5a48', [.4, 1.6, 1], { desc: 'No tiene mandíbulas: se agarra a otros peces con una boca de ventosa llena de dientes. Un parásito casi prehistórico.' }),
    S('cinta', 'Pez cinta', 'Lepidopus caudatus', 'raro', 'O', 100, 190, 'noche', OP, 50, 2, [80, 150], [.5, 3], 12, 'long', '#c8d2d6', [.2, 1.6, .5], { desc: 'Cuerpo largo y plateado como una cinta de acero. De noche sube desde el fondo hasta la superficie.' }),
    S('piloto', 'Pez piloto', 'Naucrates ductor', 'raro', 'O', 40, 190, 'dia', ['paddle'], 48, 2, [25, 50], [.3, 1.5], 10, 'fish', '#5a82a8', [0, 1.5, .5], { pat: 'stripes', desc: 'Rayado de azul, acompaña a tiburones y barcos aprovechando los restos de comida. De ahí su nombre.' }),
    // ---- Pequeñas y muy valiosas por su rareza (solo anzuelos pequeños)
    S('cardenal', 'Pez cardenal', 'Apogon imberbis', 'poco', 'R', 3, 40, 'noche', OS, 30, 0, [8, 14], [.01, .04], 400, 'fish', '#e0603a', [1.4, .4, 1], { keepShallow: true, desc: 'Rojo y de ojos enormes: de día se esconde en cuevas y de noche caza. El macho incuba los huevos dentro de su boca.' }),
    S('angula', 'Angula', 'Anguilla anguilla', 'raro', 'A', 0, 8, 'noche', ['orilla'], 52, 0, [6, 9], [.002, .006], 9000, 'long', '#d8e0d0', [.3, 1.6, 1], { keepShallow: true, desc: 'La cría transparente de la anguila, casi invisible, que sube por las desembocaduras. Es de lo más caro de la mesa y su captura está muy regulada.' }),
    S('pipa', 'Pez pipa', 'Syngnathus acus', 'raro', 'P', 1, 30, 'dia', OS, 50, 0, [12, 22], [.003, .012], 3500, 'long', '#8aa05a', [.3, 1, 1.5], { keepShallow: true, desc: 'Pariente alargado del caballito de mar y igual de raro: es el macho quien lleva los huevos en una bolsa del vientre. Se camufla entre la posidonia.' }),
    S('caballito', 'Caballito de mar', 'Hippocampus guttulatus', 'epico', 'P', 1, 25, 'dia', OS, 70, 0, [10, 16], [.01, .03], 6000, 'seahorse', '#d8a838', [.2, .6, 1.6], { keepShallow: true, desc: 'Un pez, aunque no lo parezca: se agarra a la posidonia con la cola y es el macho quien da a luz a las crías. Está protegido: encontrar uno es un regalo del mar.' }),
    // ---- Épicos
    S('gitano', 'Gitano', 'Mycteroperca rubra', 'epico', 'R', 15, 120, 'any', ['sub'], 75, 4, [70, 140], [6, 35], 40, 'fish', '#8a6a4a', [1, 1, 1], { pat: 'spots', desc: 'Primo del mero que cambia de color según su estado de ánimo. Tímido y difícil de ver.' }),
    S('albacora', 'Albacora', 'Thunnus alalunga', 'epico', 'O', 90, 190, 'dia', ['paddle'], 82, 4, [80, 130], [15, 40], 14, 'tuna', '#3f6a90', [0, 2, 0], { desc: 'Su larguísima aleta pectoral la delata. Es el «atún blanco» de las conservas.' }),
    S('carabinero', 'Carabinero', 'Aristaeus antennatus', 'epico', 'A', 150, 190, 'noche', OP, 75, 4, [12, 24], [.05, .2], 280, 'shrimp', '#c82a22', [0, 1.5, 1], { desc: 'Marisco de un rojo vivo que vive en aguas profundas. Uno de los más caros del mercado.' }),
    S('tintorera', 'Tintorera', 'Prionace glauca', 'epico', 'O', 120, 190, 'noche', ['paddle'], 90, 5, [180, 300], [30, 100], 8, 'shark', '#2e4a7a', [0, 2, 0], { desc: 'Tiburón azul esbelto, de aletas largas. Viaja miles de kilómetros siguiendo las corrientes.' }),
    // ---- Legendarios
    S('mantarraya', 'Diablo de mar', 'Mobula mobular', 'leyenda', 'O', 140, 190, 'dia', ['paddle'], 95, 5, [200, 500], [100, 500], 5, 'ray', '#445a70', [0, 1.5, 1], { desc: 'La mantarraya del Mediterráneo, de varios metros de envergadura. Salta fuera del agua y se alimenta de plancton.' }),
    S('martillo', 'Pez martillo', 'Sphyrna zygaena', 'leyenda', 'O', 130, 190, 'dia', ['paddle'], 98, 5, [200, 350], [60, 200], 6, 'shark', '#6a7a82', [0, 2, 0], { desc: 'La cabeza en forma de martillo le da una visión amplia y detecta las señales eléctricas de las presas bajo la arena.' }),
    S('blanco', 'Tiburón blanco', 'Carcharodon carcharias', 'leyenda', 'O', 150, 190, 'dia', ['paddle'], 110, 5, [300, 500], [300, 900], 3, 'shark', '#8a96a0', [0, 2, 0], { desc: 'El gran depredador del Mediterráneo, hoy en peligro crítico. Verlo es un privilegio.' }),
  ];

  /* Descripciones de las especies originales */
  const DESC = {
    boqueron: 'El pececillo más querido de Málaga: frito, en vinagre o en tortilla. Va en enormes bancos y es base de toda la cadena alimentaria.',
    sardina: 'Pez azul rico en omega-3. El espeto de sardinas asadas en la arena es seña de identidad de las playas malagueñas.',
    mojarra: 'Pariente pequeño del sargo, muy común entre las rocas. Pica con casi cualquier cebo.',
    salmonete: 'Rebusca en la arena con unos barbillones sensibles para encontrar gusanos y crustáceos.',
    sargo: 'Sus dientes recuerdan a los de una persona: los usa para partir mejillones y erizos.',
    boga: 'Pececillo plateado de banco, de líneas doradas. Abunda entre la posidonia.',
    salema: 'Se alimenta de algas y posidonia. Algunos ejemplares, comidos en ciertas épocas, pueden provocar alucinaciones.',
    chopa: 'Muy desconfiada. En primavera los machos construyen nidos y los vigilan con celo.',
    tordo: 'Un lábrido de colores cuyos machos construyen nidos de algas.',
    caballa: 'Pez azul veloz de banco, muy rico en grasas saludables.',
    jurel: 'Depredador de banco que persigue a los boquerones cerca de la superficie.',
    dorada: 'Su fuerte mandíbula tritura mejillones y almejas. Nace macho y se hace hembra con los años.',
    lubina: 'Cazadora astuta de espuma y rompientes; los pescadores la llaman la reina del oleaje.',
    pagel: 'Pez rosado de fondos de arena, muy apreciado a la plancha.',
    lenguado: 'Nace con un ojo a cada lado y, al crecer, uno migra al otro lado de la cabeza. Se camufla en el fondo.',
    sepia: 'Cambia de color en un segundo y suelta tinta si se asusta. Su concha interna es el «hueso de sepia».',
    calamar: 'Atraído por la luz, caza de noche. Nada a reacción expulsando agua.',
    pulpo: 'Uno de los animales más inteligentes del mar: abre frascos, usa herramientas y se cuela por huecos diminutos. ¡Tiene tres corazones!',
    raya: 'Pariente de los tiburones: no tiene huesos, su esqueleto es de cartílago. Pone cápsulas de huevos.',
    arana: '¡Peligro! Sus espinas dorsales inyectan un veneno muy doloroso. Se entierra en la arena y espera. Nunca la cojas con la mano.',
    cabracho: 'Rojo y espinoso: sus espinas pican y duelen, aunque su carne es exquisita. Se camufla entre las rocas.',
    rubio: 'Con aletas pectorales como alas. «Camina» sobre el fondo con unos radios libres y gruñe al sacarlo del agua.',
    palometa: 'Surfista de las rompientes: caza en la espuma de las olas.',
    gallo: 'Tiene una mancha negra en el costado: según la leyenda, la huella del dedo de San Pedro.',
    cangrejo: 'De fuerte pinza y ojos rojos, sale de noche entre las rocas. Su pellizco duele.',
    erizo: 'Sus púas protegen unas gónadas muy apreciadas. Cuidado al pisarlos.',
    morena: 'Vive escondida en grietas. Tiene una segunda mandíbula en la garganta que lanza hacia delante para tragar a sus presas.',
    congrio: 'Anguila marina enorme de grietas y pecios; puede superar los dos metros.',
    denton: 'Depredador dentudo y rápido, uno de los peces más codiciados de las rocas.',
    corvina: 'Gruñe: emite sonidos con su vejiga natatoria. Un gran trofeo nocturno.',
    barracuda: 'Cazador veloz de dientes afilados que se ve en aguas abiertas.',
    rape: 'Camuflado en el fondo, agita un señuelo sobre su boca para atraer a las presas. ¡Cabeza enorme!',
    bonito: 'Parecido al atún pero más pequeño. Caza en bancos veloces y persigue a los boquerones.',
    pargo: 'Rosado y robusto, vive sobre fondos mixtos. En la zona lo llaman bocinegro.',
    lampuga: 'Cambia de color al ser capturada: dorado, verde y azul eléctrico. Crece rapidísimo.',
    gamba: 'Crustáceo de aguas profundas, de un rojo intenso. Un manjar de la costa andaluza.',
    cigala: 'Marisco de fondos fangosos que sale de sus madrigueras por la noche.',
    loro: 'El único pez loro del Mediterráneo: raspa las algas con una especie de pico.',
    mero: 'Nace hembra y cambia a macho con los años. Es curioso, se acerca a los buceadores y vive décadas.',
    langosta: 'La reina de los crustáceos mediterráneos: no tiene pinzas grandes, pero sí unas antenas enormes.',
    bogavante: 'De pinzas grandes y color azulado en vida; se vuelve rojo al cocerse.',
    cherna: 'Gigante de aguas profundas. De joven acompaña a los objetos flotantes.',
    medregal: 'Rápido, poderoso y combativo: uno de los mayores retos de la pesca.',
    atun: 'Puede cruzar el Atlántico y mantiene el cuerpo más cálido que el agua. Emblema del Estrecho y de sus almadrabas.',
    mola: 'El pez óseo más pesado del mundo. Se tumba al sol en la superficie y se alimenta de medusas.',
    marrajo: 'El tiburón más rápido, hasta unos 70 km/h. Salta fuera del agua al ser capturado.',
    espada: 'Su espada rompe los bancos de peces. Llega a las aguas del Estrecho en verano.',
  };

  for (const sp of G.SPECIES) if (DESC[sp.id]) sp.desc = DESC[sp.id];
  G.SPECIES.push(...NEW);
  G.SPECIES_BY_ID = Object.fromEntries(G.SPECIES.map(s => [s.id, s]));
  // precio base de todos los peces al doble (€/kg)
  for (const sp of G.SPECIES) sp.eurKg = Math.round(sp.eurKg * 2 * 10) / 10;
  const total = G.SPECIES.length;
  G.MILESTONES = { 10: 100, 25: 400, 40: 1000, 60: 2500, 80: 5000, 100: 9000 };
  G.MILESTONES[total] = 25000;

  /* Lo grande y valioso vive mar adentro: mínimo 120 m de la orilla */
  for (const sp of G.SPECIES) {
    if (!sp.keepShallow && (sp.rar === 'epico' || sp.rar === 'leyenda' || (sp.rar === 'raro' && sp.kg[1] >= 10))) { sp.dmin = Math.max(sp.dmin, 120); sp.dmax = 190; }
    if (['mero', 'langosta', 'bogavante', 'gitano', 'cherna'].includes(sp.id)) sp.hab = 'RA';
  }

  /* Modalidades: orilla / paddle y kayak / submarina / barco (próximamente).
     Las especies de fondo profundo o muy grandes ya no se pescan desde la orilla. */
  const BOAT_ONLY = new Set(['atun', 'mola', 'marrajo', 'espada', 'tintorera', 'blanco', 'martillo', 'mantarraya', 'albacora', 'carabinero']);
  for (const sp of G.SPECIES) {
    const o = sp.modes;
    let m = [];
    if (BOAT_ONLY.has(sp.id)) m = ['barco'];
    else {
      if (o.includes('orilla') && sp.dmin <= 30 && sp.kg[1] <= 20) m.push('orilla');
      if ((o.includes('paddle') || o.includes('orilla')) && sp.dmax >= 40) m.push('paddle');
      if (o.includes('sub')) m.push('sub');
      if ((sp.dmax >= 100 && sp.kg[1] >= 3) || sp.id === 'cherna' || sp.id === 'medregal') m.push('barco');
    }
    sp.modes = m.length ? m : o.slice();
  }

  /* Especies protegidas: soltarlas es lo correcto; quedártelas arriesga una multa */
  ['pulpo', 'mero', 'gitano', 'corvallo', 'caballito', 'pipa', 'anguila', 'angula', 'cigarra', 'langosta', 'atun', 'blanco', 'martillo', 'mantarraya', 'marrajo', 'tintorera'].forEach(id => { if (G.SPECIES_BY_ID[id]) G.SPECIES_BY_ID[id].prot = true; });
  G.PROT_FINE = 5;      // la multa es 5 veces el valor del pez
  G.PROT_CHANCE = 0.5;  // probabilidad de que te pille la policía

  /* Basura que a veces se engancha al sedal */
  G.TRASH = [
    { id: 'lata', name: 'Lata de bebida', desc: 'Una lata de aluminio puede tardar siglos en desaparecer del mar y sus bordes cortan a los animales.' },
    { id: 'botella', name: 'Botella de plástico', desc: 'El plástico se rompe en microplásticos que acaban en el plancton, en los peces… y en nuestro plato.' },
    { id: 'vaper', name: 'Vaper desechable', desc: 'Lleva una batería de litio y plásticos: nunca debe acabar en el mar. Ha llegado hasta el fondo.' },
    { id: 'bolsa', name: 'Bolsa de plástico', desc: 'Las tortugas la confunden con una medusa y se la comen. Es una de las basuras más comunes del Mediterráneo.' },
  ];

  /* Cada anzuelo solo pica peces de cierto largo (cm): los pequeños, peces pequeños; los grandes, peces grandes */
  [[0, 22], [0, 32], [18, 50], [30, 75], [50, 130], [80, 500]].forEach((r, i) => { G.HOOKS[i].cm = r; });

  G.hookFitsSp = (h, sp) => Math.min(sp.cm[1], h.cm[1]) - Math.max(sp.cm[0], h.cm[0]) >= Math.max(2, 0.12 * (sp.cm[1] - sp.cm[0]));

  /* Peso máximo (kg) que aguantan caña e hilo: un pez más pesado es casi imposible de sacar */
  [3, 6, 12, 25, 60, 200].forEach((c, i) => { G.RODS[i].cap = c; });
  [2, 4, 9, 20, 50, 160].forEach((c, i) => { G.LINES[i].cap = c; });
})();
