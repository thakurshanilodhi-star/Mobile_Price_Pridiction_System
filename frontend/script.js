// ===== Configuration =====
const API_BASE_URL = "";

// ===== Exact Price Anchor Config (INR) =====
const exactPriceConfig = {
    low_cost: { basePrice: 7500, scale: 2500 },
    medium_cost: { basePrice: 14800, scale: 4200 },
    high_cost: { basePrice: 26500, scale: 6500 },
    very_high_cost: { basePrice: 44500, scale: 11000 }
};

// ===== Feature Config =====
const featureConfig = {
    battery_power: { unit: " mAh", step: 1 },
    blue: { unit: "", type: "toggle" },
    clock_speed: { unit: " GHz", step: 0.1 },
    dual_sim: { unit: "", type: "toggle" },
    fc: { unit: " MP", step: 1 },
    four_g: { unit: "", type: "toggle" },
    int_memory: { unit: " GB", step: 1 },
    m_dep: { unit: " cm", step: 0.1 },
    mobile_wt: { unit: " g", step: 1 },
    n_cores: { unit: " cores", step: 1 },
    pc: { unit: " MP", step: 1 },
    px_height: { unit: " px", step: 1 },
    px_width: { unit: " px", step: 1 },
    ram: { unit: " MB", step: 1 },
    sc_h: { unit: " cm", step: 1 },
    sc_w: { unit: " cm", step: 1 },
    talk_time: { unit: " hrs", step: 1 },
    three_g: { unit: "", type: "toggle" },
    touch_screen: { unit: "", type: "toggle" },
    wifi: { unit: "", type: "toggle" }
};

// ===== DOM Elements =====
const form = document.getElementById('predictForm');
const resultsSection = document.getElementById('resultsSection');
const loadingOverlay = document.getElementById('loadingOverlay');
const apiStatus = document.getElementById('apiStatus');

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    checkApiStatus();
    setInterval(checkApiStatus, 10000);

    // Initialize all range inputs
    document.querySelectorAll('input[type="range"]').forEach(input => {
        updateValue(input.id);
    });
});

// ===== Update Range Value Display =====
function updateValue(id) {
    const input = document.getElementById(id);
    const display = document.getElementById(id + '-val');
    const config = featureConfig[id];

    if (display && config) {
        display.textContent = input.value + config.unit;
    }
}

// ===== Check API Status =====
async function checkApiStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, { 
            method: 'GET',
            mode: 'cors',
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            apiStatus.className = 'status-badge online';
            apiStatus.querySelector('.status-text').textContent = 'API Online';
        } else {
            throw new Error('API not responding');
        }
    } catch (error) {
        apiStatus.className = 'status-badge offline';
        apiStatus.querySelector('.status-text').textContent = 'API Offline - Start backend!';
    }
}

// ===== Load Sample Data =====
async function loadSample() {
    try {
        const response = await fetch(`${API_BASE_URL}/sample`);
        const sample = await response.json();

        // Fill form with sample data
        Object.keys(sample).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = sample[key] === 1;
                } else {
                    element.value = sample[key];
                    updateValue(key);
                }
            }
        });

        // Add visual feedback
        const btn = document.querySelector('.btn-secondary');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Loaded!';
        btn.style.borderColor = '#22c55e';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.borderColor = '';
        }, 1500);

    } catch (error) {
        // Fallback sample if API is offline
        const fallbackSample = {
            battery_power: 1500, blue: 1, clock_speed: 2.0, dual_sim: 1,
            fc: 8, four_g: 1, int_memory: 32, m_dep: 0.5, mobile_wt: 150,
            n_cores: 4, pc: 12, px_height: 1080, px_width: 1920, ram: 2048,
            sc_h: 14, sc_w: 7, talk_time: 12, three_g: 1, touch_screen: 1, wifi: 1
        };

        Object.keys(fallbackSample).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = fallbackSample[key] === 1;
                } else {
                    element.value = fallbackSample[key];
                    updateValue(key);
                }
            }
        });
    }
}

// ===== Collect Form Data =====
function collectFormData() {
    const data = {};

    Object.keys(featureConfig).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                data[key] = element.checked ? 1 : 0;
            } else {
                data[key] = parseFloat(element.value);
            }
        }
    });

    return data;
}

// ===== Show Loading =====
function showLoading() {
    loadingOverlay.classList.add('active');
}

// ===== Hide Loading =====
function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// ===== Animate Confidence Ring =====
function animateConfidenceRing(percentage) {
    const ring = document.getElementById('confidenceRing');
    const circumference = 2 * Math.PI * 45; // 283
    const offset = circumference - (percentage / 100) * circumference;

    // Reset first
    ring.style.strokeDashoffset = circumference;

    setTimeout(() => {
        ring.style.strokeDashoffset = offset;
    }, 100);
}

// ===== Format Exact INR Price =====
function formatExactINR(amount) {
    return '₹' + Math.round(amount).toLocaleString('en-IN');
}

// ===== Compute Spec Boost From Current Inputs =====
function getSpecFactor(specs) {
    if (!specs) return 0;
    const ramNorm = ((specs.ram || 2048) - 256) / (4000 - 256);
    const batNorm = ((specs.battery_power || 1500) - 500) / (2000 - 500);
    const memNorm = ((specs.int_memory || 32) - 2) / (64 - 2);
    const camNorm = (((specs.pc || 12) + (specs.fc || 8)) - 0) / 40;
    return (0.45 * ramNorm + 0.20 * batNorm + 0.20 * memNorm + 0.15 * camNorm) - 0.5;
}

// ===== Display Results =====
function displayResults(result, inputSpecs = null) {
    resultsSection.style.display = 'block';

    const probs = result.probabilities || {};
    const specFactor = getSpecFactor(inputSpecs);

    // Compute exact price for each tier & overall exact price
    const tierPrices = {};
    let exactTotalPrice = 0;
    let totalProb = 0;

    Object.entries(exactPriceConfig).forEach(([key, cfg]) => {
        const p = Number(probs[key] || 0);
        const tierExact = Math.max(3999, cfg.basePrice + specFactor * cfg.scale);
        tierPrices[key] = tierExact;
        exactTotalPrice += (p / 100) * tierExact;
        totalProb += p;
    });

    const finalExactPrice = totalProb > 0 ? exactTotalPrice : exactPriceConfig.medium_cost.basePrice;

    // Update prediction badge
    const badge = document.getElementById('predictionBadge');
    const label = document.getElementById('predictionLabel');
    const priceRangeEl = document.getElementById('predictionPriceRange');
    label.textContent = result.predicted_label;
    if (priceRangeEl) {
        priceRangeEl.textContent = `Exact Price: ${formatExactINR(finalExactPrice)}`;
    }
    badge.style.background = result.color;
    badge.style.boxShadow = `0 4px 15px ${result.color}40`;

    // Update confidence
    document.getElementById('confidenceValue').textContent = Math.round(result.confidence);
    animateConfidenceRing(result.confidence);

    // Update probability bars with percentage + exact price
    const probMap = {
        'low_cost': 'low',
        'medium_cost': 'medium',
        'high_cost': 'high',
        'very_high_cost': 'veryhigh'
    };

    Object.entries(probMap).forEach(([apiKey, uiKey]) => {
        const value = Number(probs[apiKey] || 0);
        const exactTierVal = tierPrices[apiKey];
        const bar = document.getElementById(`bar-${uiKey}`);
        const val = document.getElementById(`val-${uiKey}`);

        if (bar && val) {
            bar.style.width = '0%';
            val.textContent = '0%';

            setTimeout(() => {
                bar.style.width = `${value}%`;
                val.textContent = `${value}% • ${formatExactINR(exactTierVal)}`;
            }, 200);
        }
    });

    // Update top features with exact price share
    const featuresGrid = document.getElementById('featuresGrid');
    featuresGrid.innerHTML = '';

    result.top_features.forEach((feat, index) => {
        const impPct = (feat.importance * 100);
        const exactShare = (impPct / 100) * finalExactPrice;
        const chip = document.createElement('div');
        chip.className = 'feature-chip';
        chip.style.animationDelay = `${index * 0.1}s`;
        chip.innerHTML = `
            <div class="feat-name">${formatFeatureName(feat.feature)}</div>
            <div class="feat-value">${feat.value}</div>
            <div class="feat-importance">${impPct.toFixed(1)}% • ${formatExactINR(exactShare)}</div>
        `;
        featuresGrid.appendChild(chip);
    });

    // Scroll to results on mobile
    if (window.innerWidth < 1024) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ===== Format Feature Name =====
function formatFeatureName(name) {
    const names = {
        'battery_power': 'Battery',
        'ram': 'RAM',
        'pc': 'Primary Cam',
        'fc': 'Front Cam',
        'int_memory': 'Storage',
        'screen_size': 'Screen',
        'pixel_density': 'Pixel Density',
        'total_camera': 'Total Cam',
        'memory_score': 'Memory Score',
        'n_cores': 'CPU Cores',
        'clock_speed': 'Clock Speed',
        'px_height': 'Res Height',
        'px_width': 'Res Width',
        'mobile_wt': 'Weight',
        'sc_h': 'Screen H',
        'sc_w': 'Screen W',
        'talk_time': 'Talk Time',
        'm_dep': 'Depth',
        'blue': 'Bluetooth',
        'dual_sim': 'Dual SIM',
        'four_g': '4G',
        'three_g': '3G',
        'touch_screen': 'Touch',
        'wifi': 'WiFi'
    };
    return names[name] || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ===== Handle Form Submit =====
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = collectFormData();
    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        hideLoading();
        displayResults(result, data);

    } catch (error) {
        hideLoading();

        // Show error in results section
        resultsSection.style.display = 'block';
        const badge = document.getElementById('predictionBadge');
        const label = document.getElementById('predictionLabel');
        const priceRangeEl = document.getElementById('predictionPriceRange');
        label.textContent = 'Error - Check API';
        if (priceRangeEl) priceRangeEl.textContent = '';
        badge.style.background = '#ef4444';

        // Reset bars
        ['low', 'medium', 'high', 'veryhigh'].forEach(key => {
            const bar = document.getElementById(`bar-${key}`);
            const val = document.getElementById(`val-${key}`);
            if (bar) bar.style.width = '0%';
            if (val) val.textContent = '0%';
        });

        document.getElementById('featuresGrid').innerHTML = 
            '<div style="color: #ef4444; text-align: center; padding: 1rem;">' +
            '<i class="fas fa-exclamation-triangle"></i> ' +
            'Please start the backend server first!<br>' +
            '<code style="color: #a0a0c0; font-size: 0.85rem;">cd backend && uvicorn app:app --reload</code>' +
            '</div>';

        console.error('Prediction error:', error);
    }
});

// ===== Add gradient definition for SVG =====
const svgNS = "http://www.w3.org/2000/svg";
const defs = document.createElementNS(svgNS, "defs");
const linearGradient = document.createElementNS(svgNS, "linearGradient");
linearGradient.setAttribute("id", "gradient");
linearGradient.setAttribute("x1", "0%");
linearGradient.setAttribute("y1", "0%");
linearGradient.setAttribute("x2", "100%");
linearGradient.setAttribute("y2", "100%");

const stop1 = document.createElementNS(svgNS, "stop");
stop1.setAttribute("offset", "0%");
stop1.setAttribute("stop-color", "#6366f1");

const stop2 = document.createElementNS(svgNS, "stop");
stop2.setAttribute("offset", "100%");
stop2.setAttribute("stop-color", "#ec4899");

linearGradient.appendChild(stop1);
linearGradient.appendChild(stop2);
defs.appendChild(linearGradient);

// Insert into all SVGs
setTimeout(() => {
    document.querySelectorAll('svg').forEach(svg => {
        if (!svg.querySelector('defs')) {
            svg.insertBefore(defs.cloneNode(true), svg.firstChild);
        }
    });
}, 100);