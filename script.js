document.addEventListener("DOMContentLoaded", () => {
  const stimulusSlider = document.getElementById("stimulus");
  const stimulusValue = document.getElementById("stimulusValue");
  const plotDiv = document.getElementById("plot");

  stimulusSlider.addEventListener("input", () => {
    stimulusValue.textContent = stimulusSlider.value;
    simulateActionPotential(stimulusSlider.value);
  });

  function simulateActionPotential(stimulus) {
    const time = [];
    const voltage = [];
    let v = -70; // Resting potential
    const dt = 0.1;

    for (let t = 0; t <= 50; t += dt) {
      time.push(t);
      // Simplified spike response
      v += stimulus > 40 && t > 10 && t < 20 ? 10 - (v / 10) : -(v + 70) * dt;
      voltage.push(v);
    }

    Plotly.newPlot(plotDiv, [
      {
        x: time,
        y: voltage,
        mode: "lines",
        name: "Membrane Potential",
      },
    ], {
      title: "Action Potential Simulation",
      xaxis: { title: "Time (ms)" },
      yaxis: { title: "Voltage (mV)" },
    });
  }

  simulateActionPotential(stimulusSlider.value); // Initial render
});
