
// Variabili per il canvas
let xMax = 400;
let yMax = 600;

// Altre variabili globali
let table;

let bckgcolor = "#bee1ee";

// Generi da confrontare
let genre_names = [
    "pop", "rock", "jazz", "classical", "country",
    "metal", "reggae", "blues", "hip-hop", "edm"
];

// Array con i nomi dei generi che hanno dati
let valid_genre_names = [];

// Array con le medie di popolarità
let genre_means = [];

let meanSize;
let stdDevSize;


async function setup() {
    createCanvas(xMax, yMax);

    // Caricamento del dataset
    table = await loadTable(
        "spotify-tracks-dataset-detailed.csv",
        ",",
        "header"
    );

    frameRate(30);
    angleMode(DEGREES);

    // Creo un array per ogni genere
    let genre_values = [];

    for (let g = 0; g < genre_names.length; g++) {
        genre_values.push([]);
    }

    // Leggo tutte le righe del CSV
    for (let i = 0; i < table.getRowCount(); i++) {

        let genre = table.getString(i, "track_genre");
        let popularity = table.getNum(i, "popularity");

        // Cerco la posizione del genere nell'array
        let g = genre_names.indexOf(genre);

        // Controllo che il genere esista e che il valore sia valido
        if (g != -1 && ruleOne(popularity)) {
            genre_values[g].push(popularity);
        }
    }

    // Calcolo la media di popolarità per ogni genere
    for (let g = 0; g < genre_names.length; g++) {

        if (genre_values[g].length > 0) {

            // Aggiungo insieme il nome e la sua media
            valid_genre_names.push(genre_names[g]);
            genre_means.push(meanOfArray(genre_values[g]));
        }
    }

    // Calcolo le statistiche solo se ho dei dati
    if (genre_means.length > 0) {
        meanSize = meanOfArray(genre_means);
        stdDevSize = stdDevOfArray(genre_means);
    }
}


// Controllo dei valori validi
function ruleOne(value) {
    return !isNaN(value) && value > 0 && value <= 100;
}


// Calcolo della media con un ciclo for
function meanOfArray(inputArr) {

    let sum = 0;

    for (let i = 0; i < inputArr.length; i++) {
        sum += inputArr[i];
    }

    return sum / inputArr.length;
}


// Calcolo della deviazione standard
function stdDevOfArray(inputArr) {

    let m = meanOfArray(inputArr);
    let variance = 0;

    for (let i = 0; i < inputArr.length; i++) {

        let tmp = inputArr[i] - m;
        variance += Math.pow(tmp, 2);
    }

    variance = variance / inputArr.length;

    return Math.sqrt(variance);
}


// Secondo metodo per calcolare la media
function mean(arr) {

    const sum = arr.reduce((a, b) => a + b, 0);

    return sum / arr.length;
}


// Secondo metodo per calcolare la deviazione standard
function standardDeviation(arr) {

    const m = mean(arr);

    const variance = arr.reduce(
        (sum, x) => sum + (x - m) ** 2,
        0
    ) / arr.length;

    return Math.sqrt(variance);
}


// Disegno del grafico a barre
function drawGenresAsChart(list_means) {

    push();

    let xMin = 45;
    let chartXMax = 390;

    let yMin = 50;
    let chartYMax = 260;

    // Disegno gli assi
    stroke(155);
    strokeWeight(2);

    line(xMin, chartYMax, xMin, yMin);
    line(xMin, chartYMax, chartXMax, chartYMax);

    // Titolo dell'asse Y
    push();

    noStroke();
    fill(0);
    textSize(14);

    translate(20, 155);
    rotate(-90);

    textAlign(CENTER);
    text("Popolarità", 0, 0);

    pop();

    // Titolo del grafico
    noStroke();
    fill(0);
    textSize(18);
    textAlign(CENTER);

    text("Popolarità media per genere musicale", 200, 30);

    // Calcolo lo spazio disponibile per ogni barra
    let barSpace = (chartXMax - xMin) / list_means.length;

    let barWidth = barSpace * 0.6;

    // Disegno una barra per ogni genere
    for (let i = 0; i < list_means.length; i++) {

        // Posizione orizzontale della barra
        let xPoint = xMin + barSpace * i + barSpace / 2;

        // Posizione verticale in base alla popolarità
        let yPoint = map(
            list_means[i],
            0,
            100,
            chartYMax,
            yMin
        );

        // Disegno la barra
        fill("#2d8ac8");
        noStroke();

        rect(
            xPoint - barWidth / 2,
            yPoint,
            barWidth,
            chartYMax - yPoint
        );

        // Scrivo il valore sopra la barra
        fill(0);
        textSize(10);
        textAlign(CENTER);

        text(
            list_means[i].toFixed(1),
            xPoint,
            yPoint - 7
        );

        // Scrivo il nome del genere sotto la barra
        push();

        translate(xPoint, chartYMax + 12);
        rotate(45);

        textAlign(LEFT);
        textSize(10);

        text(valid_genre_names[i], 0, 0);

        pop();
    }

    pop();
}


// Disegno finale
function draw() {

    background(bckgcolor);

    // Aspetto che i dati siano caricati
    if (genre_means.length == 0) {

        fill(0);
        textSize(20);

        text("Caricamento...", 20, 40);

        return;
    }

    // Disegno il grafico
    drawGenresAsChart(genre_means);

    // Mostro le statistiche
    fill(0);
    noStroke();
    textSize(14);
    textAlign(LEFT);

    text(
        "Numero di generi: " + genre_means.length +
        "\nPopolarità media: " + meanSize.toFixed(2) +
        "\nVariabilità della popolarità: " + stdDevSize.toFixed(2),
        20,
        510
    );
}
