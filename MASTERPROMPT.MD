Act as an elite frontend engineer specializing in creative coding, math-based SVG animations, and minimalist, high-conversion UI/UX layouts.

Build a single-page, fully responsive web application for a "Fluid SVG Wave Background Generator." 

Infrastructure & Deployment Constraints:
- The entire application must be 100% client-side (vanilla HTML/Tailwind/JavaScript or React/Vite) so it can be hosted instantly on Cloudflare Pages via GitHub.
- There must be zero external database or backend server dependencies. All states and processes must live locally in the user's browser.

CRITICAL ANIMATION BYPASS (Read carefully before generating code):
Do NOT use canvas pixel tracing, custom canvas context painting, or heavy physics/vector libraries. 
Instead, construct the moving waves by applying a simple mathematical sine calculation directly into an SVG string path during a high-performance `requestAnimationFrame` loop. 

Use this exact loop algorithm structure to completely eliminate layout friction and frame stuttering:
1. Track a global timeline phase variable: `let phase = 0;`
2. On every frame, increment the phase tracker based on user speed: `phase += speed;`
3. Generate the path string dynamically using a loop across a fixed native coordinate space (e.g., 1440 width units):
   let d = `M 0 ${defaultHeight}`;
   for (let x = 0; x <= 1440; x += 40) {
       let y = defaultHeight + Math.sin((x * frequency) + phase) * amplitude;
       d += ` L ${x} ${y}`;
   }
   d += ` L 1440 900 L 0 900 Z`;
4. Instantly inject this string directly into the DOM path element: `pathElement.setAttribute('d', d);`
5. Repeat this logic for up to 3 separate path elements layered on top of each other inside a single `<svg>` viewbox, assigning slightly offset phase speeds, base heights, and frequencies to create an organic, moving sense of depth.

Controls Sidebar UI Layout:
Build a clean, modern, dark-themed sidebar docked to the left side of the screen. The right side of the screen should display the full-screen, live-animating SVG background natively. Keep the controls dead simple, mapping these precise HTML inputs straight to your wave animation variables:
- Number of Waves (Slider: 1 to 3 paths visible)
- Animation Speed (Slider adjusting the phase increment per frame)
- Wave Height (Slider directly multiplying the Math.sin amplitude variable)
- Color Gradient Picker (A visual grid or dropdown allowing users to select between 3 premium color gradient palettes—like Emerald Glass, Electric Silk, and Deep Neon—which update the SVG's <linearGradient> coordinates).

Freemium Setup & Monetization Hook:
At the bottom of the sidebar, display an "Export Asset" container with a clear value hierarchy:
1. "Copy Code Block (Free)": A prominent button that captures the current DOM structure of the active `<svg>`, strips out the live JavaScript animation loop text, and copies it directly to the user's clipboard as a clean, production-ready static inline SVG vector code block.
2. "Unlock Premium HD Bundle ($4.99)": A locked button styled with a premium accent color and a gold lock icon. Include small caption text below reading: "Unlocks infinite raw looping SVG animation code, 4K high-res video loops, and desktop live wallpaper presets."
- For now, wire this premium button up to an active JavaScript overlay modal that simulates a payment checkout container, leaving a clear placeholder function where setting `isPremiumUser = true` can be hooked up to a client-side licensing system later.

Ensure the entire codebase is self-contained, beautifully polished with Tailwind CSS, completely error-free, and deployment-ready.