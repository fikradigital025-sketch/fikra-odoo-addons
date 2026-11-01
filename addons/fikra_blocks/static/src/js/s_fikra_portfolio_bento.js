/** @odoo-module **/
// Fikra Portfolio Bento — public widgets for the bento section:
//   1. A rotating 3D globe rendered with the embedded `cobe` library.
//   2. A copy-to-clipboard button for the email card.
//
// The globe libraries (cobe + phenomenon) are ES modules. To avoid breaking
// Odoo's concatenated asset bundle, they are NOT declared as bundle assets.
// Instead they are imported dynamically at runtime, as native ES modules,
// only when a globe canvas is actually on the page.

import publicWidget from "@web/legacy/js/public/public_widget";

// Absolute URLs to the embedded libraries (served as static files).
const PHENOMENON_URL = "/fikra_blocks/static/lib/phenomenon/phenomenon.js";
const COBE_URL = "/fikra_blocks/static/lib/cobe/cobe.js";

// Cache the dynamic import so the globe libs load only once per page.
let cobeModulePromise = null;

/**
 * Dynamically import the cobe factory as a native ES module.
 * cobe internally imports "phenomenon"; because the browser resolves that
 * bare specifier differently, we load our local build whose first import
 * was rewritten to a relative path at install time.
 * @returns {Promise<Function>} the createGlobe factory
 */
function loadCobe() {
    if (!cobeModulePromise) {
        // Native dynamic import keeps ESM syntax out of Odoo's bundle.
        cobeModulePromise = import(/* @ignore */ COBE_URL).then(
            (mod) => mod.default || mod
        );
    }
    return cobeModulePromise;
}

// ---------------------------------------------------------------------------
// Globe widget
// ---------------------------------------------------------------------------
const FikraBentoGlobe = publicWidget.Widget.extend({
    selector: ".s_fikra_portfolio_bento",

    /**
     * Draw the rotating globe on the canvas, on the frontend only.
     * Any failure here is caught so it can never break the rest of the page.
     */
    async start() {
        await this._super(...arguments);

        if (this.editableMode) {
            return;
        }
        const canvas = this.el.querySelector(".js_fikra_globe");
        if (!canvas) {
            return;
        }

        try {
            const createGlobe = await loadCobe();
            if (typeof createGlobe !== "function") {
                return;
            }

            let phi = 0;
            const size = 400;
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
                markerColor: [0.42, 0, 0.95],
                glowColor: [0.1, 0.1, 0.15],
                markers: [
                    { location: [13.5, 2.1], size: 0.06 },
                    { location: [41.3, 36.3], size: 0.06 },
                ],
                onRender: (state) => {
                    state.phi = phi;
                    phi += 0.005;
                },
            });
        } catch {
            // Globe is a progressive enhancement: ignore any load/render error.
        }
    },

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