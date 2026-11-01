// Artwork and scan effect supplied by the owner, generated at https://ascii.rest/make/.
// A local canvas player keeps the artwork independent of the external mount.js service.
(() => {
  const canvas = document.getElementById('ascii-img-0235');
  const context = canvas?.getContext('2d');
  if (!context) return;

  const cols = 64, rows = 24, fps = 30;
  const ART = String.raw`

                                                         __ppp
                                                   __ppq8888"
                                             .__pp88888888"
                                        __pp888888888888P'
                                  .__pp88888888P8888888"
                             __pp88888888P""' _p88888P
                        ._pp888P^""""'    ,  q88888P'
                     ~=OPY"'    .__pp^'_pP'.p8888P"
                          .__pp88P"'_ppP' _88888"
                    .__pp88888P" __p88"  )8888P
               __pp88888888""  _p888"   p888P'
          _pp8888888888P"'  _p8888"   _p88P"
           "88888888P"   _p88888P'   _888"
             ""88"'   _p888888P'    _88P
                   __p888888P"     q8P'
                 _p88888888"      qP"
              _p888888888"       pP
           _p8888888888P'       /
         _p8888888888P'
      _p88888888888P"
   ._p888888888888"
  =YYYY888888P"""

`;
  const INK = String.raw`

                                                         06625
                                                   4064444465
                                             44117326444460
                                        411111117326666624
                                  5677711111111732266225
                             4166622377115500 53322234
                        01326666605555    6  07333345
                     4055550    0111110111041777774
                          002337711001110 4117714
                    442664666220 407115  011110
               61773264404460  022375   011115
          4111117326644000  4446635   011110
           45111732665   440004650   07715
             555555   4440000465    0775
                   44640000045     0355
                 42664000005      555
              413264400000       55
           41177266400000       0
         47777732644400
      443377773266445
   4432223777332665
  445525555555555

`;
  // The supplied palette's dark-page colours, followed by the two scan levels.
  const palette = [
    '#808080', '#FFFFFF', '#808080', '#FFFFFF', '#808080', '#FFFFFF', '#808080', '#FFFFFF',
    '#FC4C13', '#FFFFFF', '#FC4C13', '#FFFFFF', '#FC4C13', '#FFFFFF', '#FC4C13', '#FFFFFF',
    '#FFFFFF', '#FC4C13', '#FFFFFF', '#FC4C13', '#FFFFFF', '#FC4C13', '#FFFFFF', '#FC4C13',
  ];
  const lines = text => {
    const source = text.slice(1, -1).split('\n');
    return Array.from({length: rows}, (_, y) => (source[y] || '').padEnd(cols).slice(0, cols));
  };
  const art = lines(ART), ink = lines(INK);
  const occupied = art.map((line, y) => line.trim() ? y : -1).filter(y => y >= 0);
  const first = occupied[0], last = occupied[occupied.length - 1];
  const START = .5, PASS = 2, HEAD = 2, TRAIL = 5, EVERY = 5;
  const NOISE = '#$%&*+<=>?@[]{}';
  const span = last - first + 1 + HEAD + TRAIL;
  function hash(x, y, k) {
    let h = Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(k, 83492791);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  }

  let frame = 0, elapsed = 0, previous = null, lastDraw = -Infinity;
  let visible = false, pageActive = true;
  function draw(t) {
    const width = canvas.getBoundingClientRect().width;
    if (!width) return;
    const height = width * .75;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * dpr), pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    const cellWidth = width / cols, cellHeight = height / rows;
    context.font = `${cellWidth / .602}px "SFMono-Regular", Consolas, "Liberation Mono", monospace`;
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    const since = t - START;
    const at = since >= 0 ? first + span * (since % EVERY) / PASS : -Infinity;
    const tick = Math.floor(t * fps / 2);
    for (let y = 0; y < rows; y++) {
      const d = at - y;
      const level = d >= 0 && d < HEAD ? 2 : d >= HEAD && d < HEAD + TRAIL ? 1 : 0;
      for (let x = 0; x < cols; x++) {
        let ch = art[y][x];
        if (ch === ' ') continue;
        if (level === 2) {
          const h = hash(x, y, tick);
          if (h % 4) ch = NOISE[(h >>> 2) % NOISE.length];
        }
        const color = parseInt(ink[y][x], 36);
        context.fillStyle = palette[level * 8 + (Number.isFinite(color) ? color : 1)];
        context.fillText(ch, (x + .5) * cellWidth, (y + .5) * cellHeight);
      }
    }
  }
  function enabled() {
    return pageActive && visible && !document.hidden && document.documentElement.dataset.motion === 'full';
  }
  function tick(now) {
    frame = 0;
    if (!enabled()) { previous = null; return; }
    if (previous !== null) elapsed += Math.max(0, now - previous) / 1000;
    previous = now;
    if (now - lastDraw >= 1000 / fps) { draw(elapsed); lastDraw = now; }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (enabled()) {
      if (!frame) { previous = null; lastDraw = -Infinity; frame = requestAnimationFrame(tick); }
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = null;
    }
  }
  const intersection = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  });
  const resize = new ResizeObserver(() => draw(elapsed));
  const motion = new MutationObserver(sync);
  intersection.observe(canvas);
  resize.observe(canvas);
  motion.observe(document.documentElement, {attributes: true, attributeFilter: ['data-motion']});
  document.addEventListener('visibilitychange', sync);
  addEventListener('resize', () => draw(elapsed));
  addEventListener('pagehide', event => {
    pageActive = false;
    sync();
    if (!event.persisted) { intersection.disconnect(); resize.disconnect(); motion.disconnect(); }
  });
  addEventListener('pageshow', () => { pageActive = true; sync(); });
  draw(0);
})();
