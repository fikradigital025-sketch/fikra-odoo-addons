/** @odoo-module **/

/**
 * Project block (BIG style) - Fikra Blocks
 * ---------------------------------------------------------------------------
 * List view: info column + big image. A click on the big image opens the
 * project in place: the block becomes one horizontal strip (info column with
 * facts and share icons, big image at full height, gallery panels).
 *
 * Open view:
 *   - the vertical mouse wheel scrolls the strip sideways until one end is
 *     reached, then the page scrolls again; trackpad and touch swipe work
 *     natively; Left / Right arrows step through it; Escape closes it;
 *   - a mini-map above the strip shows every panel and the visible part,
 *     a click on it jumps there;
 *   - the strip height fits the screen under the site header;
 *   - only one project is open at a time.
 *
 * Image captions are numbered (01 / 05 ...). Share icons open the share
 * dialog of each network for the current page.
 *
 * Disabled in the editor: there the block shows the list view with every
 * detail visible and editable.
 */

import publicWidget from "@web/legacy/js/public/public_widget";

const OPEN_EVENT = "fikra-bp-open";

publicWidget.registry.FikraBigProject = publicWidget.Widget.extend({
    selector: ".s_fikra_bigproj",
    disabledInEditableMode: true,

    start() {
        this._handlers = [];
        this.strip = this.el.querySelector(".s_fikra_bp_strip");
        this.map = this.el.querySelector(".s_fikra_bp_map");
        this.heroImg = this.el.querySelector(".s_fikra_bp_hero img");

        this.el.classList.add("o_fikra_bp_ready");
        this._numberCaptions();

        this._on(this.heroImg, "click", () => {
            if (!this._isOpen()) {
                this.open();
            }
        });
        this._on(this.el.querySelector(".s_fikra_bp_close"), "click", () => this.close());
        this.el.querySelectorAll(".s_fikra_bp_sh[data-share]").forEach((a) => {
            this._on(a, "click", (ev) => this._share(ev, a));
        });
        this._on(this.strip, "wheel", (ev) => this._onWheel(ev), { passive: false });
        this._on(this.strip, "scroll", () => this._syncWindow(), { passive: true });
        this._on(this.map, "click", (ev) => this._onMapClick(ev));
        this._on(document, "keydown", (ev) => this._onKey(ev));
        this._on(window, "resize", () => this._onResize());
        this._on(document, OPEN_EVENT, (ev) => {
            if (ev.detail !== this.el && this._isOpen()) {
                this.close(true);
            }
        });

        return this._super(...arguments);
    },

    _on(el, ev, fn, opts) {
        if (!el) {
            return;
        }
        el.addEventListener(ev, fn, opts);
        this._handlers.push([el, ev, fn, opts]);
    },

    _isOpen() {
        return this.el.classList.contains("o_fikra_bp_open");
    },

    _smooth() {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    },

    // ------------------------------------------------------------------
    // Open / close
    // ------------------------------------------------------------------

    open() {
        // Close any other open project first (sync), then lay this one out.
        document.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: this.el }));
        this._fitHeight();
        this.el.classList.add("o_fikra_bp_open");
        if (this.strip) {
            this.strip.scrollLeft = 0;
        }
        this._scrollToBlock();
        window.requestAnimationFrame(() => this._buildMap());
        // Images still loading change the widths: rebuild the map after.
        this.el.querySelectorAll(".s_fikra_bp_strip img").forEach((img) => {
            if (!img.complete) {
                this._on(img, "load", () => this._buildMap(), { once: true });
            }
        });
    },

    close(silent) {
        if (!this._isOpen()) {
            return;
        }
        this.el.classList.remove("o_fikra_bp_open");
        this.el.style.removeProperty("--fikra-bp-h");
        if (this.map) {
            this.map.replaceChildren();
        }
        this._win = null;
        if (!silent) {
            this._scrollToBlock();
        }
    },

    // Height of the site header when it stays on screen (fixed / sticky).
    _headerOffset() {
        const header = document.querySelector("#wrapwrap > header");
        if (!header) {
            return 0;
        }
        const pos = window.getComputedStyle(header).position;
        return pos === "fixed" || pos === "sticky" ? header.getBoundingClientRect().height : 0;
    },

    // Strip height = screen height - header - mini-map row - margins.
    _fitHeight() {
        this._offset = this._headerOffset();
        const mobile = window.innerWidth < 768;
        const minH = mobile ? 300 : 380;
        // On phones the strip keeps about two thirds of the screen.
        const maxH = mobile ? window.innerHeight * 0.64 : 860;
        const free = window.innerHeight - this._offset - 36 - 24 - 6 - 32;
        const h = Math.max(minH, Math.min(maxH, free));
        this.el.style.setProperty("--fikra-bp-h", `${Math.round(h)}px`);
    },

    _scrollToBlock() {
        const top = this.el.getBoundingClientRect().top + window.scrollY - (this._offset || this._headerOffset());
        window.scrollTo({ top: Math.max(0, top), behavior: this._smooth() });
    },

    // ------------------------------------------------------------------
    // Horizontal scrolling
    // ------------------------------------------------------------------

    _onWheel(ev) {
        if (!this._isOpen() || !this.strip) {
            return;
        }
        // Trackpads already scroll sideways: leave them alone.
        if (Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) {
            return;
        }
        const max = this.strip.scrollWidth - this.strip.clientWidth;
        const left = this.strip.scrollLeft;
        const canMove = (ev.deltaY > 0 && left < max - 1) || (ev.deltaY < 0 && left > 1);
        if (!canMove) {
            return; // an end is reached: the page scrolls normally
        }
        ev.preventDefault();
        let factor = 1;
        if (ev.deltaMode === 1) {
            factor = 40;
        } else if (ev.deltaMode === 2) {
            factor = this.strip.clientWidth;
        }
        this.strip.scrollLeft = left + ev.deltaY * factor;
    },

    _onKey(ev) {
        if (!this._isOpen()) {
            return;
        }
        if (ev.key === "Escape") {
            this.close();
            return;
        }
        if (ev.key !== "ArrowRight" && ev.key !== "ArrowLeft") {
            return;
        }
        // Only when the block is on screen and the visitor is not typing.
        const r = this.el.getBoundingClientRect();
        const typing = ev.target.closest && ev.target.closest("input, textarea, [contenteditable='true']");
        if (typing || r.bottom < 0 || r.top > window.innerHeight) {
            return;
        }
        ev.preventDefault();
        const step = this.strip.clientWidth * 0.6 * (ev.key === "ArrowRight" ? 1 : -1);
        this.strip.scrollBy({ left: step, behavior: this._smooth() });
    },

    _onResize() {
        if (!this._isOpen()) {
            return;
        }
        window.cancelAnimationFrame(this._resizeFrame);
        this._resizeFrame = window.requestAnimationFrame(() => {
            this._fitHeight();
            this._buildMap();
        });
    },

    // ------------------------------------------------------------------
    // Mini-map
    // ------------------------------------------------------------------

    _buildMap() {
        if (!this.map || !this.strip || !this._isOpen()) {
            return;
        }
        const total = this.strip.scrollWidth;
        const mapW = this.map.clientWidth;
        if (!total || !mapW) {
            return;
        }
        const scale = mapW / total;
        this._scale = scale;
        // Left of the strip's scrolled content, in viewport coordinates.
        const origin = this.strip.getBoundingClientRect().left - this.strip.scrollLeft;
        const items = [
            this.el.querySelector(".s_fikra_bp_hero"),
            ...this.el.querySelectorAll(".s_fikra_bp_more > .s_fikra_bp_panel"),
        ];
        const frag = document.createDocumentFragment();
        items.forEach((item) => {
            if (!item) {
                return;
            }
            const r = item.getBoundingClientRect();
            const cell = document.createElement("span");
            cell.className = "s_fikra_bp_mapitem";
            cell.style.left = `${(r.left - origin) * scale}px`;
            cell.style.width = `${Math.max(2, r.width * scale)}px`;
            const img = item.querySelector("img");
            const src = img ? img.currentSrc || img.src : "";
            if (src) {
                cell.style.backgroundImage = `url("${src.replace(/"/g, "%22")}")`;
            } else {
                cell.classList.add("is-text");
            }
            frag.appendChild(cell);
        });
        const win = document.createElement("span");
        win.className = "s_fikra_bp_mapwin";
        frag.appendChild(win);
        this.map.replaceChildren(frag);
        this._win = win;
        this._syncWindow();
    },

    _syncWindow() {
        if (!this._win || !this.strip) {
            return;
        }
        const s = this._scale || 0;
        this._win.style.left = `${this.strip.scrollLeft * s}px`;
        this._win.style.width = `${this.strip.clientWidth * s}px`;
    },

    _onMapClick(ev) {
        if (!this.strip || !this._scale) {
            return;
        }
        const rect = this.map.getBoundingClientRect();
        const x = (ev.clientX - rect.left) / this._scale;
        this.strip.scrollTo({ left: x - this.strip.clientWidth / 2, behavior: this._smooth() });
    },

    // ------------------------------------------------------------------
    // Captions and share
    // ------------------------------------------------------------------

    _numberCaptions() {
        const panels = [...this.el.querySelectorAll(".s_fikra_bp_more > .s_fikra_bp_img")];
        const pad = (n) => String(n).padStart(2, "0");
        panels.forEach((panel, i) => {
            const count = panel.querySelector(".s_fikra_bp_count");
            if (count) {
                count.textContent = `${pad(i + 1)} / ${pad(panels.length)}`;
            }
        });
    },

    _share(ev, link) {
        ev.preventDefault();
        const url = window.location.href.split("#")[0];
        const titleEl = this.el.querySelector(".s_fikra_bp_title");
        const title = ((titleEl && titleEl.textContent) || document.title).trim();
        const u = encodeURIComponent(url);
        const t = encodeURIComponent(title);
        const targets = {
            mail: `mailto:?subject=${t}&body=${u}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
            x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
        };
        const target = targets[link.dataset.share];
        if (!target) {
            return;
        }
        if (link.dataset.share === "mail") {
            window.location.href = target;
        } else {
            window.open(target, "_blank", "noopener,noreferrer,width=640,height=560");
        }
    },

    // ------------------------------------------------------------------

    destroy() {
        this.close(true);
        window.cancelAnimationFrame(this._resizeFrame);
        this._handlers.forEach(([el, ev, fn, opts]) => el.removeEventListener(ev, fn, opts));
        this._handlers = [];
        this.el.querySelectorAll(".s_fikra_bp_count").forEach((c) => {
            c.textContent = "";
        });
        this.el.classList.remove("o_fikra_bp_ready");
        this._super(...arguments);
    },
});

export default publicWidget.registry.FikraBigProject;
