/** @odoo-module **/

/**
 * Photo gallery - Fikra Blocks
 * ---------------------------------------------------------------------------
 * Airbnb-style grid (1 large image + 4 small ones). On the live site, clicking
 * a photo or the "all photos" button opens a lightbox with arrows, keyboard
 * navigation (Escape / Left / Right) and a counter.
 *
 * In the editor nothing is bound, so the images stay selectable and can be
 * replaced with the normal Odoo image tools.
 */

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.FikraGallery = publicWidget.Widget.extend({
    selector: ".s_fikra_gallery",

    start() {
        this.index = 0;
        this.photos = [];
        this.lb = null;
        this._handlers = [];
        this._onKey = this._onKey.bind(this);

        if (!this.editableMode) {
            this._bind();
        }

        return this._super(...arguments);
    },

    // Read the sources at open time, so edits made meanwhile are picked up.
    _collect() {
        return [...this.el.querySelectorAll(".s_fikra_gallery_item img")].map((img) => ({
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt") || "",
        }));
    },

    _on(el, ev, fn) {
        if (!el) {
            return;
        }
        el.addEventListener(ev, fn);
        this._handlers.push([el, ev, fn]);
    },

    _bind() {
        this.el.querySelectorAll(".s_fikra_gallery_item").forEach((item, i) => {
            this._on(item, "click", () => this._open(i));
        });
        this._on(this.el.querySelector(".s_fikra_gallery_all"), "click", () => this._open(0));
    },

    _open(i) {
        this.photos = this._collect();
        if (!this.photos.length) {
            return;
        }
        this.index = i;
        if (!this.lb) {
            this._build();
        }
        this._render();
        document.body.classList.add("s_fikra_glb_lock");
        document.addEventListener("keydown", this._onKey);
        window.requestAnimationFrame(() => {
            if (this.lb) {
                this.lb.classList.add("is-open");
            }
        });
    },

    _close() {
        if (!this.lb) {
            return;
        }
        const lb = this.lb;
        lb.classList.remove("is-open");
        document.body.classList.remove("s_fikra_glb_lock");
        document.removeEventListener("keydown", this._onKey);
        this.lb = null;
        window.setTimeout(() => {
            if (lb.parentNode) {
                lb.parentNode.removeChild(lb);
            }
        }, 250);
    },

    _step(d) {
        if (!this.photos.length) {
            return;
        }
        this.index = (this.index + d + this.photos.length) % this.photos.length;
        this._render();
    },

    _render() {
        const photo = this.photos[this.index];
        this.lbImg.setAttribute("src", photo.src);
        this.lbImg.setAttribute("alt", photo.alt);
        this.lbCount.textContent = `${this.index + 1} / ${this.photos.length}`;
    },

    _button(cls, iconCls, label) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = cls;
        btn.setAttribute("aria-label", label);
        const icon = document.createElement("i");
        icon.className = iconCls;
        btn.appendChild(icon);
        return btn;
    },

    _build() {
        const lb = document.createElement("div");
        lb.className = "s_fikra_glb";

        const count = document.createElement("div");
        count.className = "s_fikra_glb_count";

        const img = document.createElement("img");

        const close = this._button("s_fikra_glb_close", "fa fa-times", "Fermer");
        const prev = this._button("s_fikra_glb_nav s_fikra_glb_prev", "fa fa-angle-left", "Photo précédente");
        const next = this._button("s_fikra_glb_nav s_fikra_glb_next", "fa fa-angle-right", "Photo suivante");

        close.addEventListener("click", () => this._close());
        prev.addEventListener("click", (ev) => {
            ev.stopPropagation();
            this._step(-1);
        });
        next.addEventListener("click", (ev) => {
            ev.stopPropagation();
            this._step(1);
        });
        // Click on the backdrop closes, click on the photo does not.
        lb.addEventListener("click", (ev) => {
            if (ev.target === lb) {
                this._close();
            }
        });

        lb.appendChild(count);
        lb.appendChild(close);
        lb.appendChild(prev);
        lb.appendChild(img);
        lb.appendChild(next);
        document.body.appendChild(lb);

        this.lb = lb;
        this.lbImg = img;
        this.lbCount = count;
    },

    _onKey(ev) {
        if (ev.key === "Escape") {
            this._close();
        } else if (ev.key === "ArrowLeft") {
            this._step(-1);
        } else if (ev.key === "ArrowRight") {
            this._step(1);
        }
    },

    destroy() {
        document.removeEventListener("keydown", this._onKey);
        document.body.classList.remove("s_fikra_glb_lock");
        if (this.lb && this.lb.parentNode) {
            this.lb.parentNode.removeChild(this.lb);
        }
        this.lb = null;
        this._handlers.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn));
        this._handlers = [];
        this._super(...arguments);
    },
});

export default publicWidget.registry.FikraGallery;
