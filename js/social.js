/* Choques con la gente de la playa: empujones, quejas en bocadillo y toallas con bañistas */
window.G = window.G || {};

G.Social = (function () {
  const U = G.U;
  const bubbles = [];
  const lastTowel = new Map();

  const WALK = [
    'Cabrón, me has hecho daño', 'Illo, mira por dónde vas, picha', '¿Qué pasa contigo?', 'Tira pa\'llá, bobo', 'Nene, mira que hay playa, eh',
    '¡Que me has pisao el pie!', 'Mira por dónde andas, titán', '¿Tú eres tonto o te lo haces?', '¡Aaay! Mi hombro…', 'Ten cuidao, crack',
    '¡Vaya golpe, quillo!', 'Anda ya, pesao', 'Vete a pescar a otro sitio, anda', 'Yo aquí paseando y tú de bulldozer', '¿No ves que hay gente?',
    'Oye, ¡educación!', '¡Qué torpe, hijo!', 'Pa\' la próxima avisa, ¿no?', 'Menudo despiste llevas, chiquillo', 'Illo, tranquilo, que no hay prisa',
    '¡Ojo, que no tienes ojos!', 'Pero tú de qué vas, hermano', '¡Uy, qué bruto!', 'Tira, tira, que me vas a tirar el helao', '¿Y esa caña, pa\' darme a mí?',
    'Venga ya, anda, desastre', 'A ver si miras, mi arma', 'Qué manera de ir por la vida…',
    '¡Ay, mi madre! Qué susto, quillo', 'Pero bueno, ¿tú de dónde sales, de un barco?', 'Illo, que no soy un boquerón, que me aplastas', 'Mi arma, qué cabeza tienes, chiquillo',
    '¡Anda que no hay playa pa\' ti solo!', 'Ten más cuidao, que tengo la espalda hecha polvo', '¡Pisha, que casi me tiras la cerveza!', 'Pero tú qué buscas, ¿pelea o un espeto?',
    'Ve a pescar, anda, y deja a la gente en paz', '¿Sabes lo que cuesta un espeto, quillo?', 'Illo, qué malafollá tienes', 'Que me has dao en to el brazo, hombre',
    '¡Quillo! Que voy con el helao, ¡eh!', 'Tengo la paciencia de un pulpo, pero tú te pasas', 'A ver si aprendes a andar, bulldozer', '¡Zagal! Cuidadito',
    'Que no es tuya la playa, mi arma', 'Hay que ver qué gente más desastre', 'Madre mía, qué tropiezo, quillo', 'Illo, ¿pedir perdón es mucho pedir?',
    'Ni "perdona" ni ná. Qué educación', 'Si es que no se puede ir tranquilo a la playa', 'Que yo estaba pensando en mis cosas, so bruto', '¿Con esa caña vas pegando a la gente?',
    '¡Eh, que llevo un niño aquí, pisha!', 'Anda con Dios, pero lejos de mí', '¡Ay, que me da un parraque!', 'Illo, ¿tú has visto el tamaño de la playa?', 'Pero qué gente, madre del amor hermoso',
  ];
  const LIE = [
    'Tú qué haces mirándome en bikini, guarro', '¡Eh! ¡Que estoy tomando el sol!', 'Quita de mi toalla, pesao', 'Me has levantao la arena, bobo',
    '¡Ya estoy rebozao! Gracias, eh', 'Aparta, que me tapas el sol', '¡Que estaba dormío, quillo!', 'Illo, mira por dónde pisas', 'No pases por mi toalla, anda',
    '¡Mi crema! ¡Que me la tiras!', 'Ni se te ocurra pisarme', '¿No hay sitio en toda la playa o qué?', 'Pero qué morro tienes, hijo', 'Que me estás poniendo perdío de arena',
    'Chiquillo, ¡un respeto!', '¡Mi toalla es sagrada!', 'Tira pa\'llá que me das calor', '¿Tú no tenías que estar pescando?',
    '¡Ay, mi arma! Que me has dao un pisotón en la toalla', 'Que me estoy poniendo morenita, quillo', 'Aparta, que me quitas el solito', 'Chiquillo, que estoy en mi hora de la siesta',
    'Anda, tira, que estoy leyendo mi libro', 'Illo, que tengo la cerveza al lado, ¡cuidao!', 'Esta toalla me costó cinco euros, ¡respeta!', 'Pero bueno, ¿en esta playa no hay ley?',
    'Me has hecho tragar arena, pisha', 'Sigue pescando, anda, y déjame a mí', 'No me mires, que estoy hecha un cromo', 'Madre mía, el pescaíto este…',
    '¡Tira pa\' tu caña, alma de cántaro!', 'Mira que eres pesao, chiquillo', 'Y yo aquí de relax… ¡qué poquito dura!', 'Que sí, que estoy buena, pero no me pises',
    'Eh, eh, ¡mi bolso, mi bolso!', 'Qué poca vergüenza, hijo mío', 'Pásalo bien, pero lejos de mi toalla', 'Illo, que me estás tapando el sol del mediodía',
  ];

  const GUIRI = [
    'Oh my God, sorry mate! Is this the way to the sangria?', 'Watch it, pal! I only got my sunburn yesterday!', 'Excuse me, do you know where I can get a full English breakfast?',
    'Is this the Costa del Sol or the Costa del Lobster? Look at my back!', 'Sorry, no hablo espanyol. Cerveza? Dos cerveza!', 'Ow! That was my good shoulder, I paid for this holiday!',
    'Honey, a local just crashed into me! This is so authentic!', 'Mate, I have been here three days and I still cannot say "gracias".', 'Is it normal that everything closes at siesta time?',
    'Why does the sea have so many fish and so few chips?', 'I came here for the sun, not for the bumper cars!', 'Two euros for a bottle of water?! In Manchester that is a pint!',
    'Careful, I am carrying six sangrias for the group!', 'Does anyone here sell proper tea? PROPER tea?', 'I put on factor 5. FIVE. Now look at me, I am a prawn.',
    'Is that a real fishing rod or are you just happy to see me?', 'We are lost. Is this Torremolinos? Marbella? Anywhere?', 'Sorry love, I thought you were the paella guy.',
    'My wife says I should stop talking to strangers. Hello!', 'Everything is lovely, but where is the cheddar?', 'Oi! Mind my flip-flops, they were a bargain!',
    'In England it is raining. Here you are hitting me. I prefer here.', 'Do they let you fish here? Because I just bought an inflatable flamingo.',
    'Hola! Un espeto, por favor! Is that right? ESPETO?', 'Lovely weather! Shame about the sand in my sandwich.', 'My Spanish is like my tan: only half-done.',
    'Wow, so this is how locals greet each other. I love it!', 'I need a cerveza right now!', 'This is "la ostia"!', 'Te vayas a tu pouta madre, espaniol!', 'Vamos a la playa, ole ole!', 'One more tinto de verano and I am a local, mate.', 'Mucho gracias, muy bonito, adios amigo!', 'Hasta la vista, baby! Did I say it right?', 'Un cafe con leche... and a pint. At 9 AM. Why not.', 'Hola, soy Steve. Me gusta la paella!', 'Buenos dias! Buenas noches! Buenas... something!', 'I love Spain! Everything is so... how you say... caliente!', 'Tapas! Tapas! Why is it so tiny?!', 'Fiesta! Siesta! Fiesta! Siesta! I am doing it right!', 'My hotel has a pool but I like the sea more, it has real fish!', 'Gazpacho is just cold soup. COLD SOUP!', 'Torero! Torero! Where is the bull?', 'Que pasa, tio? That is how you say it, no?', 'Oye, mi amigo, where is the toilet? El bano?', 'Adios muchachos, I am going to the chiringuito!', 'One more sangria and I will speak perfect Spanish.', 'Sorry! Sorry! Many sorries! Sorry!',
  ];
  const LIE_GUIRI = [
    'Do not move, I am working on my tan. Day 4 of 14!', 'Mate, you are blocking my vitamin D!', 'Shh! I have saved this spot since 7 AM with my towel!',
    'If you wake me up for dinner, make it a paella.', 'I am not asleep, I am just resting my eyes. And my whole body.', 'Excuse me, I paid for this sand. It was in the package!',
    'I am from Birmingham. This is the first time I have seen the sun. Go away.', 'Darling, tell him that is our beach towel!',
    'You are standing on my crisps, friend. Salt and vinegar. Very rare here.', 'I did not come to Spain to be stepped on by a fisherman!',
    'Do you have sunscreen? Mine is melting with the ice cream.', 'Quiero... tumbona. Tumbona! No, hamaca? Ugh.', 'Mi cerveza, mi toalla, mi sol. Leave me alone, amigo.', 'This is the life! Ole!', 'I am on holiday! Do not disturb! No molestar!',
  ];
  function pickMsg(list, guiri) { return Math.random() < 0.45 ? U.pick(guiri) : U.pick(list); }
  function say(x, y, text) {
    for (let i = bubbles.length - 1; i >= 0; i--) if (Math.hypot(bubbles[i].x - x, bubbles[i].y - y) < 30) bubbles.splice(i, 1);
    bubbles.push({ x, y, text, t: 0, life: 2.7 });
    if (bubbles.length > 5) bubbles.shift();
  }
  function shove(P, dx, dy, amount) {
    const d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, W = G.World;
    const nx = P.x + ux * amount, ny = P.y + uy * amount;
    if (G.S.onPaddle ? W.canPaddle(nx, ny) : W.canWalk(nx, ny, G.S.swell)) { P.x = nx; P.y = ny; }
    P.kx = ux * 7; P.ky = uy * 7; P.stun = 0.35;
    G.Audio.play('bump');
  }

  function update(dt) {
    const P = G.P, S = G.S, E = G.env, W = G.World;
    // el retroceso visual se va apagando
    if (P.kx || P.ky) { const k = Math.max(0, 1 - dt * 9); P.kx *= k; P.ky *= k; if (Math.abs(P.kx) < 0.05) P.kx = 0; if (Math.abs(P.ky) < 0.05) P.ky = 0; }
    for (const b of bubbles) b.t += dt;
    while (bubbles.length && bubbles[0].t > bubbles[0].life) bubbles.shift();
    if (S.onPaddle || P.act || (G.Dive && G.Dive.active)) return;
    // choque con gente que pasea
    for (const r of W.peopleNow(E.hour, E.t)) {
      const dx = P.x - r.x, dy = P.y - r.y, d = Math.hypot(dx, dy);
      if (d > 17) continue;
      const p = r.p;
      if (E.t - (p.lastBump || -99) < 2.6) { // separación suave si siguen pegados
        if (d < 12 && d > 0.1) shove(P, dx, dy, 0.8);
        continue;
      }
      p.lastBump = E.t;
      shove(P, dx, dy, 11);
      p.sx = -dx / (d || 1) * 22; p.sy = -dy / (d || 1) * 22; p.st = E.t;
      say(r.x, r.y - 16, pickMsg(WALK, GUIRI));
    }
  }

  /* El personaje intenta ir donde no se puede: ¿es una toalla con alguien? */
  function blocked(nx, ny) {
    const S = G.S, E = G.env, W = G.World, P = G.P;
    if (S.onPaddle) return;
    const tw = W.hitTowel(nx, ny);
    if (!tw || !tw.lie || E.hour < tw.arr || E.hour > tw.lv + 0.3) return;
    if (E.t - (lastTowel.get(tw) || -99) < 3) return;
    lastTowel.set(tw, E.t);
    G.Audio.play('bump'); P.kx = (P.x - tw.x) * 0.25; P.ky = (P.y - tw.y) * 0.25; P.stun = 0.25;
    say(tw.x, tw.y - 18, pickMsg(LIE, LIE_GUIRI));
  }

  function draw(ctx) {
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const b of bubbles) {
      const a = b.t < 0.15 ? b.t / 0.15 : b.t > b.life - 0.5 ? Math.max(0, (b.life - b.t) / 0.5) : 1;
      const words = b.text.split(' '), lines = []; let cur = '';
      for (const w of words) { if ((cur + ' ' + w).trim().length > 22) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
      lines.push(cur);
      ctx.font = '700 10.5px system-ui, sans-serif';
      const w = Math.min(160, Math.max(...lines.map(l => ctx.measureText(l).width)) + 14), h = lines.length * 13 + 8;
      const x = b.x, y = b.y - 22 - Math.min(10, b.t * 8) - h / 2;
      ctx.globalAlpha = a;
      ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - w / 2 + 6, y - h / 2); ctx.arcTo(x + w / 2, y - h / 2, x + w / 2, y + h / 2, 7); ctx.arcTo(x + w / 2, y + h / 2, x - w / 2, y + h / 2, 7); ctx.arcTo(x - w / 2, y + h / 2, x - w / 2, y - h / 2, 7); ctx.arcTo(x - w / 2, y - h / 2, x + w / 2, y - h / 2, 7); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 4, y + h / 2 - 0.5); ctx.lineTo(x, y + h / 2 + 6); ctx.lineTo(x + 4, y + h / 2 - 0.5); ctx.fill();
      ctx.fillStyle = '#1b2a3a';
      lines.forEach((l, i) => ctx.fillText(l, x, y - h / 2 + 4 + 6.5 + i * 13));
    }
    ctx.restore();
  }

  return { update, draw, blocked, say };
})();
