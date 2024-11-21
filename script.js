document.addEventListener("DOMContentLoaded", () => {
  const modeSelector = document.getElementById("clampMode");
  const voltageInput = document.getElementById("voltage");
  const currentInput = document.getElementById("current");
  const voltageValue = document.getElementById("voltageValue");
  const currentValue = document.getElementById("currentValue");
  const voltageClampControls = document.getElementById("voltageClampControls");
  const currentClampControls = document.getElementById("currentClampControls");
  const ctx = document.getElementById('plot').getContext('2d');

  let chart = null;

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

  // Function to update chart
  function updateChart(data, label, yLabel) {
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.time,
        datasets: [{
          label: label,
          data: data[label.toLowerCase()],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
          pointRadius: 0,
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: 'Time (ms)' } },
          y: { title: { display: true, text: yLabel } }
        }
      }
    });
  }

  // Event Listeners
  modeSelector.addEventListener("change", () => {
    if (modeSelector.value === "voltage") {
      voltageClampControls.style.display = "block";
      currentClampControls.style.display = "none";
    } else {
      voltageClampControls.style.display = "none";
      currentClampControls.style.display = "block";
    }
  });

  voltageInput.addEventListener("input", () => {
    voltageValue.textContent = voltageInput.value;
    const data = voltageClamp(parseFloat(voltageInput.value));
    updateChart(data, "Current", "Current (nA)");
  });

  currentInput.addEventListener("input", () => {
    currentValue.textContent = currentInput.value;
    const data = currentClamp(parseFloat(currentInput.value));
    updateChart(data, "Voltage", "Voltage (mV)");
  });

  // Initialize with Voltage Clamp
  const initialData = voltageClamp(parseFloat(voltageInput.value));
  updateChart(initialData, "Current", "Current (nA)");
});
