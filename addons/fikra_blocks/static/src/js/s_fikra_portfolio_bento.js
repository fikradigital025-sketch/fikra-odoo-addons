/** @odoo-module **/
// Fikra Portfolio Bento — public widgets for the bento section:
//   1. A rotating 3D globe rendered with the embedded `cobe` library.
//   2. A copy-to-clipboard button for the email card.

import publicWidget from "@web/legacy/js/public/public_widget";
// cobe ships as an ESM module exporting createGlobe as default.
import createGlobe from "../lib/cobe/cobe";

// ---------------------------------------------------------------------------
// Globe widget
// ---------------------------------------------------------------------------
const FikraBentoGlobe = publicWidget.Widget.extend({
    selector: ".s_fikra_portfolio_bento",

    /**
     * Draw the rotating globe on the canvas. Runs only on the frontend
     * (not in the website editor) to avoid spawning animation frames
     * while editing.
     */
    start() {
        const def = this._super(...arguments);

        // Do not run the animation inside the website editor.
        if (this.editableMode) {
            return def;
        }

        const canvas = this.el.querySelector(".js_fikra_globe");
        if (!canvas || typeof createGlobe !== "function") {
            return def;
        }

        let phi = 0;
        const size = 400; // internal render size in px (CSS scales it down)

        this._globe = createGlobe(canvas, {
            devicePixelRatio: 2,
            width: size * 2,
            height: size * 2,
            phi: 0,
            theta: 0.3,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.3, 0.3, 0.4],
            markerColor: [0.42, 0, 0.95], // blueberry accent
            glowColor: [0.1, 0.1, 0.15],
            markers: [
                { location: [13.5, 2.1], size: 0.06 },  // Niamey, Niger
                { location: [41.3, 36.3], size: 0.06 },  // Samsun, Turkey
            ],
            onRender: (state) => {
                // Auto-rotate the globe.
                state.phi = phi;
                phi += 0.005;
            },
        });

        return def;
    },

    /**
     * Destroy the globe instance when the widget is torn down to free
     * the animation frame and GPU context.
     */
    destroy() {
        if (this._globe) {
            this._globe.destroy();
            this._globe = null;
        }
        this._super(...arguments);
    },
});

// ---------------------------------------------------------------------------
// Copy-email widget
// ---------------------------------------------------------------------------
const FikraBentoCopyEmail = publicWidget.Widget.extend({
    selector: ".s_fikra_portfolio_bento",
    events: {
        "click .js_fikra_copy_email": "_onCopyClick",
    },

    /**
     * Copy the email from the button's data-email attribute and give
     * short visual feedback on the label.
     */
    async _onCopyClick(ev) {
        const btn = ev.currentTarget;
        const email = btn.dataset.email;
        const label = btn.querySelector(".js_fikra_copy_label");
        if (!email || !label) {
            return;
        }

        try {
            await navigator.clipboard.writeText(email);
        } catch {
            // Clipboard API may be unavailable (e.g. non-secure context).
            return;
        }

        const original = label.textContent;
        label.textContent = "Email copié !";
        btn.classList.add("is-copied");

        clearTimeout(this._copyTimer);
        this._copyTimer = setTimeout(() => {
            label.textContent = original;
            btn.classList.remove("is-copied");
        }, 2000);
    },
});

publicWidget.registry.FikraBentoGlobe = FikraBentoGlobe;
publicWidget.registry.FikraBentoCopyEmail = FikraBentoCopyEmail;

export default { FikraBentoGlobe, FikraBentoCopyEmail };