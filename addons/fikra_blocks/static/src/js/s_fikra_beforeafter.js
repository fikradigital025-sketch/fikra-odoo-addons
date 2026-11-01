/** @odoo-module **/

/**
 * Comparateur avant / après — Fikra Blocks
 * ---------------------------------------------------------------------------
 * Le curseur natif <input type="range"> pilote une variable CSS. Tout le
 * rendu (découpe de l'image, position de la poignée) est fait en CSS à partir
 * de cette seule variable.
 *
 * Ce widget n'est PAS désactivé dans l'éditeur : contrairement au compteur,
 * faire glisser le curseur pendant l'édition est utile pour vérifier le
 * cadrage des deux images.
 */

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.FikraBeforeAfter = publicWidget.Widget.extend({
    selector: ".s_fikra_ba",
    events: {
        "input .s_fikra_ba_range": "_onInput",
    },

    start() {
        this.el.querySelectorAll(".s_fikra_ba_frame").forEach((frame) => {
            const range = frame.querySelector(".s_fikra_ba_range");
            if (range) {
                frame.style.setProperty("--fikra-ba-pos", `${range.value}%`);
            }
        });
        return this._super(...arguments);
    },

    _onInput(ev) {
        const frame = ev.target.closest(".s_fikra_ba_frame");
        if (frame) {
            frame.style.setProperty("--fikra-ba-pos", `${ev.target.value}%`);
        }
    },
});

export default publicWidget.registry.FikraBeforeAfter;
