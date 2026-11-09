let data;
let genres = ["pop", "rock", "jazz", "classical", "country"];
let colors = ["#e76f51", "#457b9d", "#9b5de5", "#f4a261", "#2a9d8f"];
let tracks = [];      // un oggetto per ogni brano
let avgPop = [];      // popolarità media di ogni genere
let hovered = null;   // brano sotto il mouse

// parametri del layout
const MAX_PER_GENRE = 200;  // campione dichiarato nel sottotitolo
const COLS = 10;            // cerchi per riga dentro un pannello
const SPACING = 18;         // distanza tra i cerchi
const PANEL_W = 200;
const PANEL_H = 450;
const PANEL_Y = 100;

async function setup() {
  createCanvas(1100, 720);
  data = await loadTable("spotify-tracks-dataset-detailed.csv", ",", "header");

  let count = [0, 0, 0, 0, 0];
  let sum = [0, 0, 0, 0, 0];

  // prefiltering: tengo solo i generi scelti, al massimo MAX_PER_GENRE brani ciascuno
  for (let i = 0; i < data.getRowCount(); i++) {
    let g = genres.indexOf(data.getString(i, "track_genre"));
    if (g === -1 || count[g] >= MAX_PER_GENRE) continue;

    let pop = data.getNum(i, "popularity");
    tracks.push({
      name: data.getString(i, "track_name"),
      artist: data.getString(i, "artists"),
      popularity: pop,
      genre: g,
      n: 0
    });
    count[g]++;
    sum[g] += pop;
  }

  // media della popolarità per genere
  for (let g = 0; g < genres.length; g++) {
    avgPop.push(sum[g] / count[g]);
  }

  // ordino dal più popolare al meno popolare, poi assegno la posizione n
  // dentro il genere: i brani più popolari finiscono in alto
  tracks.sort((a, b) => b.popularity - a.popularity);
  let pos = [0, 0, 0, 0, 0];
  for (let i = 0; i < tracks.length; i++) {
    tracks[i].n = pos[tracks[i].genre];
    pos[tracks[i].genre]++;
  }
}

function draw() {
  background("#bee1ee");
  if (data === undefined) return;

  drawTitle();
  drawPanels();
  drawGlyphs();
  drawLegend();

  if (hovered !== null) drawTooltip();
}

function drawTitle() {
  fill(20);
  noStroke();
  textAlign(LEFT);
  textSize(28);
  text("THE SOUND OF POPULARITY", 30, 45);
  textSize(13);
  text("Ogni cerchio è un brano Spotify: per ogni genere i primi " +
       MAX_PER_GENRE + " brani del dataset, ordinati dal più al meno popolare.", 30, 70);
}

// sfondo, nome e statistiche di ogni genere
function drawPanels() {
  for (let g = 0; g < genres.length; g++) {
    let panelX = 30 + g * (PANEL_W + 10);

    fill(255, 150);
    stroke(255);
    rect(panelX, PANEL_Y, PANEL_W, PANEL_H, 10);

    noStroke();
    fill(colors[g]);
    textAlign(CENTER);
    textSize(16);
    text(genres[g].toUpperCase(), panelX + PANEL_W / 2, PANEL_Y + 28);

    fill(20);
    textSize(11);
    text("popolarità media: " + avgPop[g].toFixed(1),
         panelX + PANEL_W / 2, PANEL_Y + 48);
  }
}

// un glifo (cerchio) per ogni brano
function drawGlyphs() {
  hovered = null;

  for (let i = 0; i < tracks.length; i++) {
    let t = tracks[i];

    let panelX = 30 + t.genre * (PANEL_W + 10);
    let x = panelX + 10 + SPACING / 2 + (t.n % COLS) * SPACING;
    let y = PANEL_Y + 80 + floor(t.n / COLS) * SPACING;
    let size = map(t.popularity, 0, 100, 4, 15);

    let over = dist(mouseX, mouseY, x, y) < size / 2 + 2;
    if (over) hovered = t;

    if (over) {
      fill(20);
      circle(x, y, size + 5);   // evidenzia il cerchio sotto il mouse
    } else {
      fill(colors[t.genre]);
      noStroke();
      circle(x, y, size);
    }
  }
}

function drawLegend() {
  let y = 600;
  noStroke();
  textAlign(LEFT);

  fill(20);
  textSize(14);
  text("COME LEGGERE IL GRAFICO", 30, y);

  textSize(12);

  // colore = genere
  text("Colore = genere musicale", 30, y + 25);
  for (let g = 0; g < genres.length; g++) {
    fill(colors[g]);
    circle(40 + g * 90, y + 45, 12);
    fill(20);
    text(genres[g], 52 + g * 90, y + 49);
  }

  // dimensione = popolarità
  text("Dimensione = popolarità", 520, y + 25);
  fill(90);
  circle(530, y + 45, 4);
  circle(555, y + 45, 9);
  circle(585, y + 45, 15);
  fill(20);
  text("bassa", 600, y + 49);
  text("→ alta", 645, y + 49);

  // interazione
  text("Passa il mouse su un cerchio per vedere titolo, artista e popolarità.",
       30, y + 85);
}

function drawTooltip() {
  let label = hovered.name + " - " + hovered.artist +
              " (popolarità " + hovered.popularity + ")";
  textSize(12);
  let w = textWidth(label) + 20;
  let x = min(mouseX + 12, width - w - 5);   // non esce a destra
  let y = mouseY - 35;

  fill(30);
  noStroke();
  rect(x, y, w, 26, 6);
  fill(255);
  textAlign(LEFT);
  text(label, x + 10, y + 17);
}