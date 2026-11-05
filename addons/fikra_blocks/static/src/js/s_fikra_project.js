/** @odoo-module **/

/**
 * Project block - Fikra Blocks
 * ---------------------------------------------------------------------------
 * Two responsibilities:
 *   1. Draw the oblique connector between the small image and the big image.
 *      This runs in BOTH the live site and the editor, so the architect sees
 *      the line while composing the page. The anchor flips with the
 *      `o_fikra_proj_flip` class (small image at the bottom vs at the top).
 *   2. On the live site only, unfold the detail cards to the right of the big
 *      image when it is clicked.
 *
 * Why the collapse is enabled by JS (class `o_fikra_proj_ready`) and never by
 * CSS alone: inside the editor the widget stays in "open" mode, so every card
 * remains visible and editable. Without JS the cards also stay visible. The
 * fold is an enhancement, never a condition for the content to exist.
 */

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.FikraProject = publicWidget.Widget.extend({
    selector: ".s_fikra_project",

    start() {
        this.row = this.el.querySelector(".s_fikra_project_row");
        this._draw = this._draw.bind(this);

        // 1. Connector, always drawn.
        this._draw();
        window.addEventListener("resize", this._draw);
        if (this.row) {
            this.row.addEventListener("scroll", this._draw, { passive: true });
        }

        // 2. Click-to-reveal, live site only (not in the editor).
        if (!this.editableMode && !this.el.classList.contains("o_fikra_proj_static")) {
            this.el.classList.add("o_fikra_proj_ready");
            const big = this.el.querySelector(".s_fikra_project_big img");
            if (big) {
                this._onBigClick = this._onBigClick.bind(this);
                big.addEventListener("click", this._onBigClick);
            }
        }

        return this._super(...arguments);
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
        if (this.row) {
            this.row.removeEventListener("scroll", this._draw);
        }
        this.el.classList.remove("o_fikra_proj_ready", "o_fikra_proj_open");
        this._super(...arguments);
    },
});

export default publicWidget.registry.FikraProject;
