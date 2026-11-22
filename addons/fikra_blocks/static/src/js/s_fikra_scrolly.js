/** @odoo-module **/

/**
 * Pinned-media scroll section - Fikra Blocks
 * ---------------------------------------------------------------------------
 * The media frame is pinned by CSS (position: sticky). This widget only picks
 * which image and which step are active: an IntersectionObserver with a band
 * around the middle of the viewport reports the step currently centred.
 *
 * In the editor the block is unstacked (class o_fikra_sy_edit) so every image
 * and every step stays visible and editable.
 *
 * Steps and images are read from the DOM, so duplicating a step and adding its
 * image is enough to extend the sequence. If there are fewer images than
 * steps, the last image is kept.
 */

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.FikraScrolly = publicWidget.Widget.extend({
    selector: ".s_fikra_scrolly",

    start() {
        this.steps = [...this.el.querySelectorAll(".s_fikra_sy_step")];
        this.imgs = [...this.el.querySelectorAll(".s_fikra_sy_img")];

        if (this.editableMode) {
            this.el.classList.add("o_fikra_sy_edit");
            return this._super(...arguments);
        }

        if (this.steps.length) {
            this._activate(0);
            this._observer = new window.IntersectionObserver(
                (entries) => this._onIntersect(entries),
                { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
            );
            this.steps.forEach((step) => this._observer.observe(step));
        }

        return this._super(...arguments);
    },

    _onIntersect(entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                this._activate(this.steps.indexOf(entry.target));
            }
        });
    },

    _activate(i) {
        if (i < 0) {
            return;
        }
        this.steps.forEach((step, k) => step.classList.toggle("is-active", k === i));
        if (!this.imgs.length) {
            return;
        }
        // Fall back to the last image when there are fewer images than steps.
        const target = Math.min(i, this.imgs.length - 1);
        this.imgs.forEach((img, k) => img.classList.toggle("is-active", k === target));
    },

    destroy() {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
        this.el.classList.remove("o_fikra_sy_edit");
        this.steps.forEach((step) => step.classList.remove("is-active"));
        this._super(...arguments);
    },
});

export default publicWidget.registry.FikraScrolly;
