document.addEventListener('DOMContentLoaded', () => {
    // Shared chart styling parameters matched to the website theme
    const gridColor = 'rgba(255, 255, 255, 0.05)';
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#8b949e';
    const tickColor = 'rgba(255,255,255,0.4)';
    const accentGreen = '#2ea043';
    const accentOrange = '#d2691e';
    const accentPurple = '#8a2be2';
    const accentCyan = '#00c3ff';
    const accentRed = '#ff4d4d';

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: textColor, font: { family: 'Inter', size: 12 } }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(13, 17, 23, 0.9)',
                titleColor: '#fff',
                bodyColor: '#c9d1d9',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: { color: gridColor },
                ticks: { color: tickColor }
            },
            y: {
                grid: { color: gridColor },
                ticks: { color: tickColor }
            }
        }
    };

    // --- Load Battery Data ---
    fetch('matlab_results/battery_data.json')
        .then(response => response.json())
        .then(data => {
            // Battery Discharge Curve
            const ctxDischarge = document.getElementById('batteryDischargeChart').getContext('2d');
            window.batteryDischargeChart = new Chart(ctxDischarge, {
                type: 'line',
                data: {
                    labels: data.time.map(t => t.toFixed(1)), // x-axis as categories 
                    datasets: [
                        {
                            label: 'Approach 1 — LiDAR (42.5W)',
                            data: data.voltage_ap1,
                            borderColor: accentGreen,
                            backgroundColor: 'transparent',
                            borderWidth: 2.5,
                            pointRadius: 0,
                            tension: 0.1
                        },
                        {
                            label: 'Approach 2 — RGB-D (42.3W)',
                            data: data.voltage_ap2,
                            borderColor: accentOrange,
                            backgroundColor: 'transparent',
                            borderWidth: 2.5,
                            pointRadius: 0,
                            tension: 0.1
                        },
                        {
                            label: 'Approach 3 — Hybrid (49.9W)',
                            data: data.voltage_ap3,
                            borderColor: accentPurple,
                            backgroundColor: 'transparent',
                            borderWidth: 2.5,
                            pointRadius: 0,
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    ...commonOptions,
                    scales: {
                        x: { 
                            ...commonOptions.scales.x, 
                            title: { display: true, text: 'Time (minutes)', color: textColor },
                            ticks: { color: tickColor, maxTicksLimit: 12 } // don't crowd the x axis
                        },
                        y: { 
                            ...commonOptions.scales.y, 
                            title: { display: true, text: 'Voltage (V)', color: textColor }, 
                            min: 9.0, max: 13.5 
                        }
                    }
                }
            });

            // Battery Runtime Bar Chart
            const ctxRuntime = document.getElementById('batteryRuntimeChart').getContext('2d');
            window.batteryRuntimeChart = new Chart(ctxRuntime, {
                type: 'bar',
                data: {
                    labels: ['LiDAR (42.5W)', 'RGB-D (42.3W)', 'Hybrid (49.9W)'],
                    datasets: [{
                        label: 'Estimated Runtime (min)',
                        data: data.runtimes,
                        backgroundColor: [accentGreen, accentOrange, accentPurple],
                        borderRadius: 6
                    }]
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        legend: { display: false }
                    },
                    scales: {
                        x: { ...commonOptions.scales.x },
                        y: { ...commonOptions.scales.y, title: { display: true, text: 'Minutes to 9.9V Cutoff', color: textColor }, beginAtZero: true }
                    }
                }
            });
        })
        .catch(err => console.error("Could not load battery data", err));

    // --- Load PID Data ---
    fetch('matlab_results/pid_data.json')
        .then(response => response.json())
        .then(data => {
            // Velocity Step Response
            const ctxVelocity = document.getElementById('pidVelocityChart').getContext('2d');
            new Chart(ctxVelocity, {
                type: 'line',
                data: {
                    labels: data.velocity_t.map(t => t.toFixed(3)),
                    datasets: [{
                        label: 'PID Response',
                        data: data.velocity_rpm,
                        borderColor: accentCyan,
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.1
                    }, {
                        label: 'Target (200 RPM)',
                        data: Array(data.velocity_t.length).fill(200),
                        borderColor: accentRed,
                        borderWidth: 1.5,
                        borderDash: [5, 5],
                        pointRadius: 0
                    }]
                },
                options: {
                    ...commonOptions,
                    scales: {
                        x: { 
                            ...commonOptions.scales.x, 
                            title: { display: true, text: 'Time (s)', color: textColor },
                            ticks: { color: tickColor, maxTicksLimit: 10 }
                        },
                        y: { 
                            ...commonOptions.scales.y, 
                            title: { display: true, text: 'Speed (RPM)', color: textColor } 
                        }
                    }
                }
            });

            // Position Step Response
            const ctxPosition = document.getElementById('pidPositionChart').getContext('2d');
            new Chart(ctxPosition, {
                type: 'line',
                data: {
                    labels: data.position_t.map(t => t.toFixed(3)),
                    datasets: [{
                        label: 'PID Response',
                        data: data.position_deg,
                        borderColor: accentCyan,
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.1
                    }, {
                        label: 'Target (90°)',
                        data: Array(data.position_t.length).fill(90),
                        borderColor: accentRed,
                        borderWidth: 1.5,
                        borderDash: [5, 5],
                        pointRadius: 0
                    }]
                },
                options: {
                    ...commonOptions,
                    scales: {
                        x: { 
                            ...commonOptions.scales.x, 
                            title: { display: true, text: 'Time (s)', color: textColor },
                            ticks: { color: tickColor, maxTicksLimit: 10 }
                        },
                        y: { 
                            ...commonOptions.scales.y, 
                            title: { display: true, text: 'Angle (deg)', color: textColor } 
                        }
                    }
                }
            });

            // Bode Plot
            const formattedBodeMag = data.bode_w.map((w, i) => ({ x: w, y: data.bode_mag[i] }));
            const formattedBodePhase = data.bode_w.map((w, i) => ({ x: w, y: data.bode_phase[i] }));

            const ctxBode = document.getElementById('pidBodeChart').getContext('2d');
            new Chart(ctxBode, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Magnitude (dB)',
                        data: formattedBodeMag,
                        borderColor: accentCyan,
                        backgroundColor: 'transparent',
                        showLine: true,
                        borderWidth: 2,
                        pointRadius: 0,
                        yAxisID: 'y'
                    }, {
                        label: 'Phase (deg)',
                        data: formattedBodePhase,
                        borderColor: accentOrange,
                        backgroundColor: 'transparent',
                        showLine: true,
                        borderWidth: 2,
                        pointRadius: 0,
                        yAxisID: 'y1'
                    }]
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                title: (tooltipItems) => 'Freq: ' + Number(tooltipItems[0].raw.x).toExponential(2) + ' rad/s',
                                label: (context) => {
                                    return context.dataset.label + ': ' + Number(context.raw.y).toFixed(2);
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'logarithmic',
                            title: { display: true, text: 'Frequency (rad/s)', color: textColor },
                            grid: { color: gridColor },
                            ticks: { 
                                color: tickColor,
                                callback: function(value, index, values) {
                                    return Number(value.toString()).toExponential(0); // display format like 1e0, 1e1
                                }
                            }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: { display: true, text: 'Magnitude (dB)', color: textColor },
                            grid: { color: gridColor },
                            ticks: { color: tickColor }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: { display: true, text: 'Phase (deg)', color: textColor },
                            grid: { drawOnChartArea: false }, // Prevent gridline overlap
                            ticks: { color: tickColor }
                        }
                    }
                }
            });
        })
        .catch(err => console.error("Could not load PID data", err));
});
