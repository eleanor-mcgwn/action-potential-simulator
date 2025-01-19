let voltage = -65;
let gNa = 120;
let gK = 36;
let gL = 0.3;
let ENa = 50;
let EK = -77;
let EL = -54.4;
let C = 1;

let dt = 0.05;
let time = 0;

let externalCurrent = 10;

let m = 0.05, h = 0.6, n = 0.32;

let voltageTrace = [];
let currentTrace = [];
let peakAmplitude = -Infinity;
let actionPotentialWidth = 0;
let spikeCount = 0;
let thresholdCrossed = false;
let startSpikeTime = 0;
let spikeInProgress = false;

let lastSpikePeak = -Infinity;
let prevPeakAmplitude = null;
let prevActionPotentialWidth = null;
let prevInterSpikeInterval = null;

let lastSpikeTime = 0;
let interSpikeInterval = 0;

let isPaused = false;

function setup() {
    let canvas = createCanvas(600, 400);
    canvas.parent('simulationArea');

    select('#currentValue').html(externalCurrent);
    select('#gNaValue').html(gNa);
    select('#gKValue').html(gK);
    select('#gLValue').html(gL);
    select('#ENaValue').html(ENa);
    select('#EKValue').html(EK);
    select('#ELValue').html(EL);
    select('#CValue').html(C);

    const currentSlider = select('#currentSlider');
    currentSlider.input(() => {
        externalCurrent = currentSlider.value();
        select('#currentValue').html(externalCurrent);
    });

    const gNaSlider = select('#gNaSlider');
    gNaSlider.input(() => {
        gNa = gNaSlider.value();
        select('#gNaValue').html(gNa);
    });

    const gKSlider = select('#gKSlider');
    gKSlider.input(() => {
        gK = gKSlider.value();
        select('#gKValue').html(gK);
    });

    const gLSlider = select('#gLSlider');
    gLSlider.input(() => {
        gL = gLSlider.value();
        select('#gLValue').html(gL);
    });

    const ENaSlider = select('#ENaSlider');
    ENaSlider.input(() => {
        ENa = ENaSlider.value();
        select('#ENaValue').html(ENa);
    });

    const EKSlider = select('#EKSlider');
    EKSlider.input(() => {
        EK = EKSlider.value();
        select('#EKValue').html(EK);
    });

    const ELSlider = select('#ELSlider');
    ELSlider.input(() => {
        EL = ELSlider.value();
        select('#ELValue').html(EL);
    });

    const CSlider = select('#CSlider');
    CSlider.input(() => {
        C = CSlider.value();
        select('#CValue').html(C);
    });

    frameRate(60);

    const resetButton = select('#resetButton');
    resetButton.mousePressed(reset);
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        select('#pauseButton').html('<i class="bi bi-play-circle"></i> Play');
    } else {
        select('#pauseButton').html('<i class="bi bi-pause-circle"></i> Pause');
    }
}

function reset() {
    voltage = -65;
    gNa = 120;
    gK = 36;
    gL = 0.3;
    ENa = 50;
    EK = -77;
    EL = -54.4;
    C = 1;
    externalCurrent = 10;

    m = 0.05;
    h = 0.6;
    n = 0.32;

    voltageTrace = [];
    currentTrace = [];
    peakAmplitude = -Infinity;
    actionPotentialWidth = 0;
    spikeCount = 0;
    thresholdCrossed = false;
    startSpikeTime = 0;
    spikeInProgress = false;

    lastSpikePeak = -Infinity;

    lastSpikeTime = 0;
    interSpikeInterval = 0;

    select('#currentSlider').value(externalCurrent);
    select('#gNaSlider').value(gNa);
    select('#gKSlider').value(gK);
    select('#gLSlider').value(gL);
    select('#ENaSlider').value(ENa);
    select('#EKSlider').value(EK);
    select('#ELSlider').value(EL);
    select('#CSlider').value(C);
}

function draw() {
    if (isPaused) return;
    background(255);

    let I_Na = gNa * Math.pow(m, 3) * h * (voltage - ENa);
    let I_K = gK * Math.pow(n, 4) * (voltage - EK);
    let I_L = gL * (voltage - EL);

    let I_total = I_Na + I_K + I_L;
    let dV = (externalCurrent - I_total) / C;
    voltage += dV * dt;

    let alpha_m = (2.5 - 0.1 * (voltage + 65)) / (Math.exp(2.5 - 0.1 * (voltage + 65)) - 1);
    let beta_m = 4 * Math.exp(-(voltage + 65) / 18);
    m += dt * (alpha_m * (1 - m) - beta_m * m);

    let alpha_h = 0.07 * Math.exp(-(voltage + 65) / 20);
    let beta_h = 1 / (Math.exp(3.0 - 0.1 * (voltage + 65)) + 1);
    h += dt * (alpha_h * (1 - h) - beta_h * h);

    let alpha_n = (0.1 - 0.01 * (voltage + 65)) / (Math.exp(1 - 0.1 * (voltage + 65)) - 1);
    let beta_n = 0.125 * Math.exp(-(voltage + 65) / 80);
    n += dt * (alpha_n * (1 - n) - beta_n * n);

    if (spikeInProgress) {
        lastSpikePeak = Math.max(lastSpikePeak, voltage);
    }

    let threshold = -20;

    if (voltage > threshold && !thresholdCrossed) {
        spikeCount++;
        startSpikeTime = time;
        thresholdCrossed = true;
        spikeInProgress = true;
        lastSpikePeak = voltage;

        if (lastSpikeTime > 0) {
            interSpikeInterval = startSpikeTime - lastSpikeTime;
        }
    }

    if (voltage < threshold && thresholdCrossed && spikeInProgress) {
        actionPotentialWidth = time - startSpikeTime;
        thresholdCrossed = false;
        spikeInProgress = false;
        peakAmplitude = lastSpikePeak;
        lastSpikeTime = time;
    }

    voltageTrace.push(voltage);

    if (voltageTrace.length > width) {
        voltageTrace.shift();
    }

    stroke(0);
    line(50, 10, 50, height - 10);

    let yAxisStart = -80;
    let yAxisEnd = 60;
    let tickInterval = 20;

    for (let i = yAxisStart; i <= yAxisEnd; i += tickInterval) {
        let y = map(i, yAxisStart, yAxisEnd, height - 10, 10);
        line(45, y, 50, y);
        textSize(12);
        textAlign(RIGHT, CENTER);
        text(i + ' mV', 40, y);
    }

    beginShape();
    for (let i = 0; i < voltageTrace.length; i++) {
        let y = map(voltageTrace[i], yAxisStart, yAxisEnd, height - 10, 10);
        vertex(i + 50, y);
    }
    endShape();

    select('#voltageValue').html(voltage.toFixed(2));
    select('#peakAmplitude').html(peakAmplitude.toFixed(2) + " mV");
    select('#actionPotentialWidth').html(actionPotentialWidth.toFixed(2) + " ms");
    select('#interSpikeInterval').html(interSpikeInterval.toFixed(2) + " ms");

    time += dt;
}
