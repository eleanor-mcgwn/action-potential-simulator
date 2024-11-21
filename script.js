document.addEventListener("DOMContentLoaded", () => {
  const modeSelector = document.getElementById("clampMode");
  const voltageInput = document.getElementById("voltage");
  const currentInput = document.getElementById("current");
  const voltageValue = document.getElementById("voltageValue");
  const currentValue = document.getElementById("currentValue");
  const voltageClampControls = document.getElementById("voltageClampControls");
  const currentClampControls = document.getElementById("currentClampControls");
  const plotDiv = document.getElementById("plot");

  // Function to simulate voltage clamp
  function voltageClamp(voltage) {
    const time = [];
    const current = [];
    let iNa = 0, iK = 0;

    for (let t = 0; t <= 50; t += 0.1) {
      time.push(t);
      if (t > 10 && t < 20) { // Simulate voltage step
        iNa = (voltage + 50) * 0.2;
        iK = (voltage - (-70)) * 0.1;
      } else {
        iNa = 0;
        iK = 0;
      }
      current.push(iNa + iK);
    }

    return { time, current };
  }

  // Function to simulate current clamp
  function currentClamp(current) {
    const time = [];
    const voltage = [];
    let v = -70; // Resting potential
    const threshold = -55;
    const dt = 0.1;

    for (let t = 0; t <= 50; t += dt) {
      time.push(t);
      if (current > 5 && t > 10 && t < 15) {
        v += (threshold - v) * 0.2; // Depolarization
      } else {
        v += (-70 - v) * 0.05; // Repolarization
      }
      voltage.push(v);
    }

    return { time, voltage };
  }

  // Function to update plot with Plotly
  function updatePlot(data, yLabel, mode) {
    const trace = {
      x: data.time,
      y: mode === "voltage" ? data.current : data.voltage,
      type: 'scatter',
      mode: 'lines',
      name: mode === "voltage" ? 'Current (nA)' : 'Voltage (mV)',
      line: { color: 'rgb(44, 160, 44)', width: 2 }
    };

    const layout = {
      title: mode === "voltage" ? 'Voltage Clamp: Current vs Time' : 'Current Clamp: Voltage vs Time',
      xaxis: { title: 'Time (ms)' },
      yaxis: { title: yLabel },
      margin: { t: 50, r: 30, b: 50, l: 60 }
    };

    Plotly.newPlot(plotDiv, [trace], layout);
  }

  // Event listeners
  modeSelector.addEventListener("change", () => {
    if (modeSelector.value === "voltage") {
      voltageClampControls.style.display = "block";
      currentClampControls.style.display = "none";
      const data = voltageClamp(parseFloat(voltageInput.value));
      updatePlot(data, 'Current (nA)', "voltage");
    } else {
      voltageClampControls.style.display = "none";
      currentClampControls.style.display = "block";
      const data = currentClamp(parseFloat(currentInput.value));
      updatePlot(data, 'Voltage (mV)', "current");
    }
  });

  voltageInput.addEventListener("input", () => {
    voltageValue.textContent = voltageInput.value;
    const data = voltageClamp(parseFloat(voltageInput.value));
    updatePlot(data, 'Current (nA)', "voltage");
  });

  currentInput.addEventListener("input", () => {
    currentValue.textContent = currentInput.value;
    const data = currentClamp(parseFloat(currentInput.value));
    updatePlot(data, 'Voltage (mV)', "current");
  });

