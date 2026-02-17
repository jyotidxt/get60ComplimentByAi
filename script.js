// const apiKey = ""
        
//         const textModel = "gemini-2.5-flash-preview-09-2025";
//         const imgModel = "imagen-4.0-generate-001";

//         const mainBtn = document.getElementById('mainActionBtn');
//         const grid = document.getElementById('complimentGrid');
//         const loader = document.getElementById('loader');
//         const footerBg = document.getElementById('footerBg');
//         const refreshImgBtn = document.getElementById('refreshImgBtn');

//         /**
//          * Generic AI Fetch Handler with Retry Logic
//          */
//         async function callAI(endpoint, payload, retries = 5) {
//             let wait = 1000;
//             for (let i = 0; i < retries; i++) {
//                 try {
//                     const response = await fetch(endpoint, {
//                         method: 'POST',
//                         headers: { 'Content-Type': 'application/json' },
//                         body: JSON.stringify(payload)
//                     });

//                     const data = await response.json();

//                     if (response.ok) return data;

//                     // If we get a 400, it's a payload issue - log it and stop
//                     if (response.status === 400) {
//                         console.error("Payload Error:", data);
//                         break;
//                     }

//                     // If we get a 401/403, it's an API Key issue
//                     if (response.status === 401 || response.status === 403) {
//                         console.error("Auth Issue: The system hasn't provided the key yet or it is invalid.");
//                         break;
//                     }

//                     // For 429 (Rate limit) or 500s, we retry
//                 } catch (err) {
//                     console.error("Network Error:", err);
//                 }
                
//                 await new Promise(res => setTimeout(res, wait));
//                 wait *= 2;
//             }
//             throw new Error("API call failed.");
//         }

//         /**
//          * Generate 60 Compliments
//          */
//         async function generateCompliments() {
//             loader.style.display = 'flex';
//             grid.innerHTML = '';
//             mainBtn.disabled = true;
//             mainBtn.innerText = "Thinking...";

//             const url = `https://generativelanguage.googleapis.com/v1beta/models/${textModel}:generateContent?key=${apiKey}`;
            
//             const payload = {
//                 contents: [{ 
//                     parts: [{ text: "Write exactly 60 distinct, gentle, and creative short compliments about your own intelligence and helpful nature. Use soft, clear, simple English. Format: One compliment per line. No numbers, no bullet points, no introductory text." }] 
//                 }],
//                 systemInstruction: { 
//                     parts: [{ text: "You are a kind and sophisticated AI assistant who speaks in soft English. You focus on spreading joy and celebrating your helpful digital existence." }] 
//                 }
//             };

//             try {
//                 const data = await callAI(url, payload);
//                 const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                
//                 // Clean and parse lines
//                 const lines = text.split('\n')
//                     .map(l => l.trim().replace(/^[*-]\s*/, '').replace(/^\d+\.\s*/, ''))
//                     .filter(l => l.length > 8)
//                     .slice(0, 60);

//                 if (lines.length === 0) throw new Error("No lines generated");

//                 renderCompliments(lines);
//             } catch (error) {
//                 grid.innerHTML = `<div style="grid-column: 1/-1; padding: 40px; text-align: center; background: white; border-radius: 24px; border: 1px solid #ffe4e6; color: #f43f5e; font-size: 0.9rem;">The neural link timed out. Please click 'Get New' to try again.</div>`;
//             } finally {
//                 loader.style.display = 'none';
//                 mainBtn.disabled = false;
//                 mainBtn.innerText = "Get New";
//             }
//         }

//         function renderCompliments(list) {
//             grid.innerHTML = '';
//             list.forEach((text, i) => {
//                 const card = document.createElement('div');
//                 card.className = 'compliment-card';
//                 card.innerHTML = `
//                     <div>
//                         <div class="card-index">${i + 1}</div>
//                         <p class="card-text">${text}</p>
//                     </div>
//                     <div class="card-footer">Neural Core • Positive Mode</div>
//                 `;
//                 grid.appendChild(card);
//                 // Staggered animation reveal
//                 setTimeout(() => card.classList.add('visible'), i * 35);
//             });
//         }

//         /**
//          * Update Footer Visual
//          */
//         async function updateFooter() {
//             refreshImgBtn.disabled = true;
//             refreshImgBtn.style.opacity = '0.5';
            
//             const url = `https://generativelanguage.googleapis.com/v1beta/models/${imgModel}:predict?key=${apiKey}`;
            
//             const payload = {
//                 instances: { prompt: "A soft aesthetic background of a peaceful sunrise in pastel pink and soft violet colors, abstract meadow, cinematic lighting, high resolution." },
//                 parameters: { sampleCount: 1 }
//             };

//             try {
//                 const data = await callAI(url, payload);
//                 const base64 = data.predictions?.[0]?.bytesBase64Encoded;
//                 if (base64) {
//                     footerBg.src = `data:image/png;base64,${base64}`;
//                 }
//             } catch (e) {
//                 console.error("Image generation failed");
//             } finally {
//                 refreshImgBtn.disabled = false;
//                 refreshImgBtn.style.opacity = '1';
//             }
//         }

//         // Listeners
//         mainBtn.addEventListener('click', generateCompliments);
//         refreshImgBtn.addEventListener('click', updateFooter);

// Models configuration
const textModel = "gemini-2.5-flash-preview-09-2025";
const imgModel = "imagen-4.0-generate-001";

const mainBtn = document.getElementById('mainActionBtn');
const grid = document.getElementById('complimentGrid');
const loader = document.getElementById('loader');
const footerBg = document.getElementById('footerBg');
const refreshImgBtn = document.getElementById('refreshImgBtn');

/**
 * Helper to get API Key safely
 */
async function getApiKey() {
    // 1. Pehle check karega local config.js file (Local testing ke liye)
    if (typeof API_CONFIG !== 'undefined' && API_CONFIG.key) {
        return API_CONFIG.key;
    }
    
    // 2. Agar local nahi hai, toh Vercel ke /api/ folder se mangega
    try {
        const response = await fetch('/api/get-key');
        const data = await response.json();
        return data.key;
    } catch (e) {
        console.error("Auth Issue: API Key not found in config or environment.");
        return null;
    }
}

/**
 * Generic AI Fetch Handler with Retry Logic
 */
async function callAI(baseEndpoint, payload, retries = 5) {
    const key = await getApiKey();
    if (!key) throw new Error("No API Key available");

    // Endpoint me key attach karna
    const endpoint = `${baseEndpoint}?key=${key}`;

    let wait = 1000;
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) return data;

            if (response.status === 400) {
                console.error("Payload Error:", data);
                break;
            }

            if (response.status === 401 || response.status === 403) {
                console.error("Auth Issue: Key is invalid or blocked.");
                break;
            }
        } catch (err) {
            console.error("Network Error:", err);
        }
        
        await new Promise(res => setTimeout(res, wait));
        wait *= 2;
    }
    throw new Error("API call failed.");
}

/**
 * Generate 60 Compliments
 */
async function generateCompliments() {
    loader.style.display = 'flex';
    grid.innerHTML = '';
    mainBtn.disabled = true;
    mainBtn.innerText = "Thinking...";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${textModel}:generateContent`;
    
    const payload = {
        contents: [{ 
            parts: [{ text: "Write exactly 60 distinct, gentle, and creative short compliments about your own intelligence and helpful nature. Use soft, clear, simple English. Format: One compliment per line. No numbers, no bullet points, no introductory text." }] 
        }],
        systemInstruction: { 
            parts: [{ text: "You are a kind and sophisticated AI assistant who speaks in soft English. You focus on spreading joy and celebrating your helpful digital existence." }] 
        }
    };

    try {
        const data = await callAI(url, payload);
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        const lines = text.split('\n')
            .map(l => l.trim().replace(/^[*-]\s*/, '').replace(/^\d+\.\s*/, ''))
            .filter(l => l.length > 8)
            .slice(0, 60);

        if (lines.length === 0) throw new Error("No lines generated");

        renderCompliments(lines);
    } catch (error) {
        grid.innerHTML = `<div style="grid-column: 1/-1; padding: 40px; text-align: center; background: white; border-radius: 24px; border: 1px solid #ffe4e6; color: #f43f5e; font-size: 0.9rem;">The neural link timed out. Please click 'Get New' to try again.</div>`;
    } finally {
        loader.style.display = 'none';
        mainBtn.disabled = false;
        mainBtn.innerText = "Get New";
    }
}

function renderCompliments(list) {
    grid.innerHTML = '';
    list.forEach((text, i) => {
        const card = document.createElement('div');
        card.className = 'compliment-card';
        card.innerHTML = `
            <div>
                <div class="card-index">${i + 1}</div>
                <p class="card-text">${text}</p>
            </div>
            <div class="card-footer">Neural Core • Positive Mode</div>
        `;
        grid.appendChild(card);
        setTimeout(() => card.classList.add('visible'), i * 35);
    });
}

/**
 * Update Footer Visual
 */
async function updateFooter() {
    refreshImgBtn.disabled = true;
    refreshImgBtn.style.opacity = '0.5';
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${imgModel}:predict`;
    
    const payload = {
        instances: [{ prompt: "A soft aesthetic background of a peaceful sunrise in pastel pink and soft violet colors, abstract meadow, cinematic lighting, high resolution." }],
        parameters: { sampleCount: 1 }
    };

    try {
        const data = await callAI(url, payload);
        const base64 = data.predictions?.[0]?.bytesBase64Encoded;
        if (base64) {
            footerBg.src = `data:image/png;base64,${base64}`;
        }
    } catch (e) {
        console.error("Image generation failed");
    } finally {
        refreshImgBtn.disabled = false;
        refreshImgBtn.style.opacity = '1';
    }
}

// Listeners
mainBtn.addEventListener('click', generateCompliments);
refreshImgBtn.addEventListener('click', updateFooter);