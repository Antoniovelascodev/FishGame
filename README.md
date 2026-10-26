# 🎣 Pesca Málaga

Juego de pesca por el Mediterráneo, ambientado en Málaga y visto desde arriba. Pensado **primero para móvil** (iPhone/Android), con joystick táctil y tres botones: **Lanzar**, **Inventario** y **Tienda**.

Todo el arte (texturas, peces, mapa) y el sonido se generan por código: no hay imágenes ni audios de terceros, así que no hay problemas de licencias para comercializarlo.

## Jugarlo en el iPhone (sin App Store)

1. Sube la carpeta `pesca-malaga/` a cualquier hosting estático con HTTPS (GitHub Pages, Netlify Drop, Cloudflare Pages…).
2. Abre la URL en **Safari** → botón **Compartir** → **Añadir a pantalla de inicio**.
3. Se abre a pantalla completa como una app y funciona sin conexión (service worker).

Para probar en local desde el ordenador (misma wifi que el móvil):

```bash
npx vite pesca-malaga --host
```

## Controles

| Acción | Móvil | PC |
|---|---|---|
| Moverse | Arrastrar en la mitad izquierda (joystick flotante) | WASD / flechas |
| Lanzar | Mantener **LANZAR** y soltar (más tiempo = más lejos); el joystick apunta | Espacio |
| Clavar | **¡CLAVAR!** cuando aparezca la sombra y el % | Espacio |
| Recoger | Mantener **RECOGE** mientras el pez no tire | Espacio |
| Inventario / Tienda | Botones | `I` / `T` |
| Bucear, subir a la tabla | Botón contextual verde | `E` |

## Qué hay en esta versión

- **Mapa de Málaga** con 4 puntos de pesca: playa de arena (La Malagueta), rocas (Peñón del Cuervo), espigón de piedra (Pedregalejo) y praderas de posidonia (El Palo). El **Puerto** aparece bloqueado.
- **Boyas a 200 m** con muro de límite, olas visibles, **días de más y menos oleaje** (Calma → Temporal), ciclo día/noche rápido (1 h de juego = 15 s) con farolas, luz cálida al atardecer y **lámpara de pesca** para la noche.
- **47 especies** del Mediterráneo con hábitat, profundidad, hora, modo de pesca, cebo favorito, tamaño, peso y valor. 5 rarezas (común → legendario).
- **Pesca con caña**: el círculo marca dónde cae el cebo; al picar ves la **sombra del pez** (su tamaño) y el **% de captura** = tu equipo (caña + hilo + anzuelo + cebo ± oleaje) frente a la dificultad del pez. Después viene el combate de tensión del hilo.
- **Economía**: vende en tu **pescadería** (empieza al 50 % y se mejora hasta el 145 %) o a **proveedores** (78 % fijo). Tienda con 6 cañas, 6 hilos, 6 anzuelos y 3 cebos de pago (gusanos, sardinas, cangrejos).
- **Pesca submarina por texto** (hasta 200 m): necesita gafas, aletas, neopreno y arpón; acechar, acercarse, esperar, disparar con % de acierto. Tiene especies exclusivas (mero, langosta, bogavante, cherna, erizo).
- **Paddle surf**: recorre toda la costa hasta las boyas y pesca desde la tabla (peces pelágicos exclusivos: atún, pez espada, marrajo, lampuga…).
- **Álbum** de colección con premios por hitos, guardado automático, sonido procedural con silencio persistente.

## Estructura

```
index.html · style.css · manifest.webmanifest · sw.js
js/data.js      especies, equipo, precios
js/world.js     costa, fondos, dibujo del mapa
js/tex.js       texturas procedurales
js/fishart.js   dibujo de peces (sombra y color)
js/fishing.js   lanzar, picada, combate, captura
js/dive.js      pesca submarina
js/ui.js        HUD, inventario, tienda, álbum
js/main.js      bucle, jugador, cámara, día/noche
```

## Jornadas, neveras y tiendas (v2)

- **Por días:** antes de cada día eliges hora de inicio y duración (1–24 h). Solo se puede vender al terminar la jornada.
- **Tiendas físicas en el paseo:** *Pesca El Anzuelo* (material, cebos, neveras), *Tu pescadería* (mejorable) y la *Lonja* (proveedores, precio fijo). Solo abren entre jornadas.
- **Cebo diario:** el cebo sobrante se estropea al acabar el día. Gusanos (barato, lento, peces comunes), sardinas (medio) y cangrejos (caro, rápido, todas las especies).
- **Neveras:** 3, 5, 10, 20, 40 y 80 peces. El pescado pierde frescura y valor con las horas; las mejores neveras lo conservan más.
- **Sombras de peces** en el agua indican bancos; a veces el lugar está vacío. De noche solo la lámpara de pesca ilumina bien.
- **Gente en la playa** hasta las 20:00 y sombrillas con colisión.

## v3: más especies, mercado variable y peces grandes

- **111 especies del Mediterráneo** (antes 47), cada una con su dato curioso en el álbum y en la tarjeta de captura.
- **Mercado de la pescadería:** cada día cambia al azar (de aproximadamente -50% a +50%) y te avisa del porcentaje. La lonja paga siempre igual.
- **Peces grandes:** son bastante más difíciles. Si pesan más de lo que aguantan tu caña e hilo (kg máximos en la tienda), la captura es casi imposible.
- **Frescura:** 1 de cada 8 peces llega mordido o herido (50–70% de frescura).
- **Nevera llena:** al pescar con la nevera llena eliges qué pez devolver al mar.

## v4: modalidades, buceo profundo y basura

- Cada especie se pesca desde **orilla, paddle/kayak, submarina o barco** (próximamente); el álbum se filtra por modalidad.
- Lo grande y valioso (épicos, legendarios y raros pesados) vive a **120 m o más** de la orilla; buceando solo aparece **al fondo**.
- A más de 100 m de la orilla, cada acción de buceo gasta **el doble de aire**.
- Si te quedas sin aire buceando, **los socorristas te rescatan**: termina el día y pagas el 50% de tu dinero y pierdes los peces de la nevera.
- Al encontrar un pez buceando ves su **imagen** (silueta si aún no lo conoces).
- Pesca y bucea **basura** (lata, botella, vaper, bolsa de plástico) con ficha educativa.
