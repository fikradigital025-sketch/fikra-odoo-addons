/** @odoo-module **/

/**
 * Project block - Fikra Blocks
 * ---------------------------------------------------------------------------
 * 1. Draws the oblique connector between the small and big images. The anchor
 *    flips with the `o_fikra_proj_flip` class (small image bottom vs top).
 *    The line is redrawn after the layout settles (next frame, full load,
 *    after the open/close transition), because centering and image loading
 *    shift the images and the line must follow them.
 * 2. On the live site only, clicking the big image unfolds the detail cards
 *    to its right.
 *
 * The collapse is enabled by JS (class `o_fikra_proj_ready`): in the editor
 * the cards stay visible and editable; without JS they stay visible too.
 */

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.FikraProject = publicWidget.Widget.extend({
    selector: ".s_fikra_project",

    start() {
        this.row = this.el.querySelector(".s_fikra_project_row");
        this._draw = this._draw.bind(this);

        // Apply the ready/closed layout FIRST, so positions are final before
        // we measure them for the connector.
        if (!this.editableMode && !this.el.classList.contains("o_fikra_proj_static")) {
            this.el.classList.add("o_fikra_proj_ready");
            const big = this.el.querySelector(".s_fikra_project_big img");
            if (big) {
                this._onBigClick = this._onBigClick.bind(this);
                big.addEventListener("click", this._onBigClick);
            }
        }

        this._scheduleDraw();
        window.addEventListener("resize", this._draw);
        window.addEventListener("load", this._draw);
        if (this.row) {
            this.row.addEventListener("scroll", this._draw, { passive: true });
        }

        return this._super(...arguments);
    },

    _scheduleDraw() {
        window.requestAnimationFrame(this._draw);
        window.setTimeout(this._draw, 150);
        window.setTimeout(this._draw, 500);
    },

    _draw() {
        const svg = this.el.querySelector(".s_fikra_project_connector");
        if (!svg || !this.row) {
            return;
        }
        const line = svg.querySelector("line");
        const small = this.el.querySelector(".s_fikra_project_small img");
        const big = this.el.querySelector(".s_fikra_project_big img");
        if (!line || !small || !big) {
            return;
        }
        const r = this.row.getBoundingClientRect();
        const a = small.getBoundingClientRect();
        const b = big.getBoundingClientRect();
        const flip = this.el.classList.contains("o_fikra_proj_flip");
        const x1 = a.right - r.left;
        const x2 = b.left - r.left;
        let y1;
        let y2;
        if (!flip) {
            // Small image at the bottom: run the line along the tops.
            y1 = a.top - r.top + 4;
            y2 = b.top - r.top + 4;
        } else {
            // Small image at the top: run the line along the bottoms.
            y1 = a.bottom - r.top - 4;
            y2 = b.bottom - r.top - 4;
        }
        svg.setAttribute("viewBox", `0 0 ${r.width} ${r.height}`);
        svg.setAttribute("width", r.width);
        svg.setAttribute("height", r.height);
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
    },

    _onBigClick() {
        const opened = this.el.classList.toggle("o_fikra_proj_open");
        this._draw();
        // Redraw after the max-width / centering transition finishes.
        window.setTimeout(this._draw, 500);
        if (!this.row) {
            return;
        }
        if (opened) {
            window.setTimeout(() => {
                this.row.scrollTo({ left: this.row.scrollWidth, behavior: "smooth" });
            }, 320);
        } else {
            this.row.scrollTo({ left: 0, behavior: "smooth" });
        }
    },

    destroy() {
        window.removeEventListener("resize", this._draw);
        window.removeEventListener("load", this._draw);
        if (this.row) {
            this.row.removeEventListener("scroll", this._draw);
        }
        this.el.classList.remove("o_fikra_proj_ready", "o_fikra_proj_open");
        this._super(...arguments);
    },
});

export default publicWidget.registry.FikraProject;
