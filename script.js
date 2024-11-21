// Initial values for simulation parameters
let voltage = -65;  // Resting potential (mV)
let gNa = 120;      // Sodium conductance (mS/cm²)
let gK = 36;        // Potassium conductance (mS/cm²)
let gL = 0.3;       // Leak conductance (mS/cm²)
let ENa = 50;       // Sodium reversal potential (mV)
let EK = -77;       // Potassium reversal potential (mV)
let EL = -54.4;     // Leak reversal potential (mV)
let C = 1;          // Membrane capacitance (µF/cm²)

let dt = 0.05;      // Time step (ms)
let time = 0;       // Time (ms)

let externalCurrent = 10;  // External current (µA/cm²)

let m = 0.05, h = 0.6, n = 0.32;  // Gate variables (initial values)

let voltageTrace = []; // To store voltage values for plotting
let currentTrace = []; // To store current values (if needed)

function setup() {
    // Create canvas for plotting
    let canvas = createCanvas(800, 400);
    canvas.parent('simulationArea');

    // Set initial values in the HTML
    select('#currentValue').html(externalCurrent);
    select('#gNaValue').html(gNa);
    select('#gKValue').html(gK);
    select('#gLValue').html(gL);
    select('#ENaValue').html(ENa);
    select('#EKValue').html(EK);
    select('#ELValue').html(EL);
    select('#CValue').html(C);

    // Set up sliders and input listeners
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

    // Set frame rate for smooth updates
    frameRate(60);

    // Reset button logic
    const resetButton = select('#resetButton');
    resetButton.mousePressed(reset);
}

// Reset all values to initial conditions
function reset() {
    voltage = -65;  // Reset voltage
    gNa = 120;      // Reset sodium conductance
    gK = 36;        // Reset potassium conductance
    gL = 0.3;       // Reset leak conductance
    ENa = 50;       // Reset sodium reversal potential
    EK = -77;       // Reset potassium reversal potential
    EL = -54.4;     // Reset leak reversal potential
    C = 1;          // Reset capacitance
    externalCurrent = 10;  // Reset external current

    // Reset gate variables
    m = 0.05;
    h = 0.6;
    n = 0.32;

    // Clear voltage trace
    voltageTrace = [];
    currentTrace = [];

    // Reset slider positions
    select('#currentSlider').value(externalCurrent);
    select('#gNaSlider').value(gNa);
    select('#gKSlider').value(gK);
    select('#gLSlider').value(gL);
    select('#ENaSlider').value(ENa);
    select('#EKSlider').value(EK);
    select('#ELSlider').value(EL);
    select('#CSlider').value(C);
}

// Main simulation loop to update voltage and plot
function draw() {
    background(255);

    // Hodgkin-Huxley equations

    // Calculate Sodium, Potassium, and Leak currents
    let I_Na = gNa * Math.pow(m, 3) * h * (voltage - ENa);
    let I_K = gK * Math.pow(n, 4) * (voltage - EK);
    let I_L = gL * (voltage - EL);

    // Total current and membrane potential update
    let I_total = I_Na + I_K + I_L;
    let dV = (externalCurrent - I_total) / C;
    voltage += dV * dt;

    // Update gate variables using differential equations
    let alpha_m = (2.5 - 0.1 * (voltage + 65)) / (Math.exp(2.5 - 0.1 * (voltage + 65)) - 1);
    let beta_m = 4 * Math.exp(-(voltage + 65) / 18);
    m += dt * (alpha_m * (1 - m) - beta_m * m);

    let alpha_h = 0.07 * Math.exp(-(voltage + 65) / 20);
    let beta_h = 1 / (Math.exp(3.0 - 0.1 * (voltage + 65)) + 1);
    h += dt * (alpha_h * (1 - h) - beta_h * h);

    let alpha_n = (0.1 - 0.01 * (voltage + 65)) / (Math.exp(1 - 0.1 * (voltage + 65)) - 1);
    let beta_n = 0.125 * Math.exp(-(voltage + 65) / 80);
    n += dt * (alpha_n * (1 - n) - beta_n * n);

    // Store the voltage values for plotting
    voltageTrace.push(voltage);

    // Keep the trace from getting too long by trimming it to the width of the canvas
    if (voltageTrace.length > width) {
        voltageTrace.shift();
    }

    // Draw the Y-axis with scale and labels
    stroke(0);
    line(50, 10, 50, height - 10);  // Y-axis line

    // Draw Y-axis ticks and labels
    let yAxisStart = -80;  // Start value for Y-axis (in mV)
    let yAxisEnd = 60;     // End value for Y-axis (in mV)
    let tickInterval = 20; // Interval for ticks (in mV)

    for (let i = yAxisStart; i <= yAxisEnd; i += tickInterval) {
        let y = map(i, yAxisStart, yAxisEnd, height - 10, 10);  // Map value to canvas height
        line(45, y, 50, y);  // Y-axis tick
        textSize(12);
        textAlign(RIGHT, CENTER);
        text(i + ' mV', 40, y);  // Label the tick
    }

    // Draw the voltage trace on the canvas
    beginShape();
    for (let i = 0; i < voltageTrace.length; i++) {
        let y = map(voltageTrace[i], yAxisStart, yAxisEnd, height - 10, 10);  // Map voltage to canvas
        vertex(i + 50, y);  // Offset by 50 to leave space for the Y-axis
    }
    endShape();

    // Display the current voltage value
    select('#voltageValue').html(voltage.toFixed(2));
}
