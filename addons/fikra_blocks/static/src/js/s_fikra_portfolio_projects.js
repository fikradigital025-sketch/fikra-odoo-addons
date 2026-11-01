/** @odoo-module **/
// Fikra Portfolio Projects — 3D tilt effect on project cover images.
// Pure DOM/CSS, no external library, so it cannot break the asset bundle.

import publicWidget from "@web/legacy/js/public/public_widget";

const FikraProjectsTilt = publicWidget.Widget.extend({
    selector: ".s_fikra_portfolio_projects",
    events: {
        "mousemove .js_fikra_tilt": "_onMove",
        "mouseleave .js_fikra_tilt": "_onLeave",
    },

    /**
     * Compute a small rotation from the cursor position over the card and
     * expose it to CSS through custom properties on the inner image.
     */
    _onMove(ev) {
        // Tilt is a desktop pointer enhancement only.
        if (this.editableMode) {
            return;
        }
        const card = ev.currentTarget;
        const img = card.querySelector(".s_fikra_project_img");
        if (!img) {
            return;
        }
        const rect = card.getBoundingClientRect();
        // Normalized cursor position in [-0.5, 0.5] on both axes.
        const px = (ev.clientX - rect.left) / rect.width - 0.5;
        const py = (ev.clientY - rect.top) / rect.height - 0.5;
        const maxTilt = 6; // degrees
        img.style.setProperty("--fikra-ry", `${(px * maxTilt).toFixed(2)}deg`);
        img.style.setProperty("--fikra-rx", `${(-py * maxTilt).toFixed(2)}deg`);
    },

    /**
     * Reset the tilt when the cursor leaves the card.
     */
    _onLeave(ev) {
        const img = ev.currentTarget.querySelector(".s_fikra_project_img");
        if (img) {
            img.style.setProperty("--fikra-ry", "0deg");
            img.style.setProperty("--fikra-rx", "0deg");
        }
    },
});

publicWidget.registry.FikraProjectsTilt = FikraProjectsTilt;

export default FikraProjectsTilt;