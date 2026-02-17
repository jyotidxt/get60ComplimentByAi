
        const apiKey = "AIzaSyBN431xfr_pupH60HDLzbK2zF0kcdfVbfg";
        const textModel = "gemini-2.5-flash-preview-09-2025";
        const imgModel = "imagen-4.0-generate-001";

        const mainBtn = document.getElementById('mainActionBtn');
        const grid = document.getElementById('complimentGrid');
        const loader = document.getElementById('loader');
        const footerBg = document.getElementById('footerBg');
        const refreshImgBtn = document.getElementById('refreshImgBtn');

        // Robust fetch with exponential backoff
        async function fetchAI(url, body, maxRetries = 5) {
            let delay = 1000;
            for (let i = 0; i < maxRetries; i++) {
                try {
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    if (res.ok) return await res.json();
                    if (res.status !== 429 && res.status < 500) break;
                } catch (e) {}
                await new Promise(r => setTimeout(r, delay));
                delay *= 2;
            }
            throw new Error("API Connection Failed");
        }

        async function getCompliments() {
            // UI State
            loader.classList.remove('hidden');
            grid.innerHTML = '';
            mainBtn.disabled = true;
            mainBtn.innerText = "Wait...";

            // Use soft English prompt
            const prompt = `Act as a very kind AI assistant. Write exactly 60 different short compliments about yourself, your intelligence, and your helpful nature. Use soft, simple English that is easy to understand. Each compliment should be one sentence. Focus on how good you are at helping others. Return only the 60 lines, no numbers.`;

            try {
                const data = await fetchAI(`https://generativelanguage.googleapis.com/v1beta/models/${textModel}:generateContent?key=${apiKey}`, {
                    contents: [{ parts: [{ text: prompt }] }]
                });

                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                const compliments = text.split('\n').filter(l => l.trim().length > 5).slice(0, 60);
                
                displayCompliments(compliments);
            } catch (error) {
                console.error(error);
                grid.innerHTML = `<div class="col-span-full p-8 text-center text-rose-400 bg-white rounded-3xl shadow border border-rose-50">Something went wrong. Let's try again in a moment.</div>`;
            } finally {
                loader.classList.add('hidden');
                mainBtn.disabled = false;
                mainBtn.innerText = "Get New";
            }
        }

        function displayCompliments(list) {
            grid.innerHTML = '';
            list.forEach((text, index) => {
                const card = document.createElement('div');
                card.className = 'compliment-card bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-rose-50 flex flex-col justify-between hover:shadow-xl hover:border-rose-100 transition-all';
                card.innerHTML = `
                    <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-50 flex items-center justify-center text-[10px] sm:text-xs font-bold text-rose-300 mb-3 sm:mb-4">
                        ${index + 1}
                    </div>
                    <p class="text-slate-700 leading-relaxed font-medium text-sm sm:text-base">${text.trim().replace(/^[*-]\s*/, '')}</p>
                    <div class="mt-3 sm:mt-4 flex justify-end">
                        <span class="text-[9px] sm:text-[10px] text-rose-200 uppercase tracking-tighter">AI Wisdom</span>
                    </div>
                `;
                grid.appendChild(card);
                
                // Staggered reveal for better optimization/perf
                setTimeout(() => card.classList.add('visible'), index * 30);
            });
        }

        async function updateFooterImage() {
            refreshImgBtn.disabled = true;
            refreshImgBtn.classList.add('opacity-50');
            
            const prompt = "A soft, aesthetic digital painting of a sunset over a calm meadow, pastel colors, rose and gold lighting, peaceful and kind atmosphere, high resolution.";
            
            try {
                const data = await fetchAI(`https://generativelanguage.googleapis.com/v1beta/models/${imgModel}:predict?key=${apiKey}`, {
                    instances: { prompt },
                    parameters: { sampleCount: 1 }
                });

                const b64 = data.predictions?.[0]?.bytesBase64Encoded;
                if (b64) {
                    footerBg.src = `data:image/png;base64,${b64}`;
                }
            } catch (e) {
                console.error("Image failed");
            } finally {
                refreshImgBtn.disabled = false;
                refreshImgBtn.classList.remove('opacity-50');
            }
        }

        mainBtn.addEventListener('click', getCompliments);
        refreshImgBtn.addEventListener('click', updateFooterImage);