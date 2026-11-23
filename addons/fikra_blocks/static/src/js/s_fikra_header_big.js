/** @odoo-module **/

/**
 * Fikra header "Navbar BIG" - Fikra Blocks
 * ---------------------------------------------------------------------------
 * 1. Logo toggle: a click on the logo shows 3 bars (as wide as the widest
 *    label of the vertical list) and drops that list below them. A second
 *    click, a click outside or Escape folds it back.
 * 2. Sub-menus: a main item that has sub-menus (menu manager) opens its row
 *    of sub-pages under the menu instead of navigating. A second click on
 *    the same item goes to its own page when it has one. On load, the item
 *    matching the current page (itself or one of its sub-pages) is marked
 *    and its row is shown.
 * 3. Search: the suggestions rotate in the field; an empty search only
 *    focuses the field.
 *
 * Disabled in the editor: the vertical list, the suggestions and the menu
 * stay visible and editable there.
 */

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.FikraHeaderBig = publicWidget.Widget.extend({
    selector: ".s_fikra_bn",
    disabledInEditableMode: true,

    start() {
        this._handlers = [];
        this.bar = this.el.querySelector(".s_fikra_bn_bar");
        if (!this.bar) {
            return this._super(...arguments);
        }
        this.brand = this.bar.querySelector(".s_fikra_bn_brand");
        this.list = this.bar.querySelector(".s_fikra_bn_list");
        this.main = this.bar.querySelector(".s_fikra_bn_main");
        this.subsWrap = this.bar.querySelector(".s_fikra_bn_subs");
        this.subs = [...this.bar.querySelectorAll(".s_fikra_bn_sub")];
        this.links = [...this.bar.querySelectorAll(".s_fikra_bn_link")];

        // Server-rendered sub-menu state, restored when the widget stops
        // (the editor then shows the header exactly as rendered).
        this._serverOpen = this.subs.filter((s) => s.classList.contains("is-open"));
        this._serverHasOpen = !!this.subsWrap && this.subsWrap.classList.contains("has-open");

        this.bar.classList.add("o_fikra_bn_ready");

        this._initToggle();
        this._initSubMenus();
        this._initSearch();

        return this._super(...arguments);
    },

    _on(el, ev, fn, opts) {
        if (!el) {
            return;
        }
        el.addEventListener(ev, fn, opts);
        this._handlers.push([el, ev, fn, opts]);
    },

    // ------------------------------------------------------------------
    // 1. Logo -> 3 bars + vertical list
    // ------------------------------------------------------------------

    _initToggle() {
        this._on(this.brand, "click", (ev) => {
            // The logo is a home link: a click must toggle, not navigate.
            ev.preventDefault();
            this._toggleList();
        });
        this._on(this.brand, "keydown", (ev) => {
            if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                this._toggleList();
            }
        });
        this._on(document, "click", (ev) => {
            if (this._isListOpen() && !ev.target.closest(".s_fikra_bn_left")) {
                this._toggleList(false);
            }
        });
        this._on(document, "keydown", (ev) => {
            if (ev.key === "Escape" && this._isListOpen()) {
                this._toggleList(false);
            }
        });
    },

    _isListOpen() {
        return this.bar.classList.contains("o_fikra_bn_open");
    },

    _toggleList(force) {
        const open = force === undefined ? !this._isListOpen() : force;
        if (open) {
            this._sizeBars();
            this._matchListBackground();
        }
        this.bar.classList.toggle("o_fikra_bn_open", open);
        if (this.brand) {
            this.brand.setAttribute("aria-expanded", open ? "true" : "false");
        }
    },

    // The bars take the width of the widest label of the list. The list is
    // folded with visibility (not display), so it can be measured.
    _sizeBars() {
        if (!this.list) {
            return;
        }
        let width = 0;
        this.list.querySelectorAll("a").forEach((a) => {
            width = Math.max(width, a.getBoundingClientRect().width);
        });
        if (width > 0) {
            this.bar.style.setProperty("--fikra-bn-bars-w", `${Math.round(width)}px`);
        }
    },

    // Give the dropped list the header's own background colour.
    _matchListBackground() {
        const bg = window.getComputedStyle(this.el).backgroundColor;
        if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
            this.bar.style.setProperty("--fikra-bn-list-bg", bg);
        }
    },

    // ------------------------------------------------------------------
    // 2. Sub-menu rows
    // ------------------------------------------------------------------

    _initSubMenus() {
        this.links.forEach((link) => {
            if (link.dataset.fikraSub) {
                this._on(link, "click", (ev) => this._onParentClick(ev, link));
            }
        });

        // Item of the current page: server-side "active" first (sub-page
        // match), then a match on the item's own page.
        const path = this._norm(window.location.pathname);
        let current = this.links.find((a) => a.classList.contains("active"));
        if (!current) {
            current = this.links.find((a) => {
                if (this._isPageLink(a) && this._norm(a.pathname) === path) {
                    return true;
                }
                const sub = this._subFor(a.dataset.fikraSub);
                return !!sub && [...sub.querySelectorAll("a")].some(
                    (s) => this._isPageLink(s) && this._norm(s.pathname) === path
                );
            });
        }
        this._pageCurrent = current || null;
        if (current) {
            this._setCurrent(current);
        }
    },

    _norm(p) {
        return (p || "/").replace(/\/+$/, "") || "/";
    },

    _isPageLink(a) {
        const href = a.getAttribute("href") || "";
        return !!href && !href.startsWith("#") && a.origin === window.location.origin;
    },

    _subFor(id) {
        return id ? this.subs.find((s) => s.dataset.fikraSub === id) : null;
    },

    _setCurrent(link) {
        this.links.forEach((a) => a.classList.toggle("is-current", a === link));
        if (this.main) {
            this.main.classList.toggle("has-current", !!link);
        }
        this._openSub(link ? link.dataset.fikraSub : null);
    },

    _openSub(id) {
        let any = false;
        this.subs.forEach((s) => {
            const on = !!id && s.dataset.fikraSub === id;
            s.classList.toggle("is-open", on);
            any = any || on;
        });
        if (this.subsWrap) {
            this.subsWrap.classList.toggle("has-open", any);
        }
    },

    _onParentClick(ev, link) {
        const sub = this._subFor(link.dataset.fikraSub);
        const isOpen = !!sub && sub.classList.contains("is-open");
        // Second click on an open item: go to its own page, if it has one.
        if (isOpen && this._isPageLink(link)) {
            return;
        }
        ev.preventDefault();
        if (isOpen) {
            // Fold back to the section of the current page.
            this._setCurrent(link === this._pageCurrent ? null : this._pageCurrent);
            return;
        }
        this._setCurrent(link);
    },

    // ------------------------------------------------------------------
    // 3. Search
    // ------------------------------------------------------------------

    _initSearch() {
        const form = this.bar.querySelector(".s_fikra_bn_search");
        const field = this.bar.querySelector(".s_fikra_bn_field");
        const input = this.bar.querySelector(".s_fikra_bn_input");
        if (!form || !field || !input) {
            return;
        }
        const sync = () => field.classList.toggle("is-filled", !!input.value);
        this._on(input, "input", sync);
        sync();

        this._on(form, "submit", (ev) => {
            if (!input.value.trim()) {
                ev.preventDefault();
                input.focus();
            }
        });

        this.words = [...this.bar.querySelectorAll(".s_fikra_bn_hints > span")];
        if (!this.words.length) {
            return;
        }
        let i = 0;
        this.words[0].classList.add("is-on");
        if (this.words.length > 1) {
            this._timer = window.setInterval(() => {
                this.words[i].classList.remove("is-on");
                i = (i + 1) % this.words.length;
                this.words[i].classList.add("is-on");
            }, 3200);
        }
    },

    // ------------------------------------------------------------------

    destroy() {
        if (this._timer) {
            window.clearInterval(this._timer);
            this._timer = null;
        }
        this._handlers.forEach(([el, ev, fn, opts]) => el.removeEventListener(ev, fn, opts));
        this._handlers = [];
        if (this.bar) {
            this.bar.classList.remove("o_fikra_bn_ready", "o_fikra_bn_open");
            this.bar.style.removeProperty("--fikra-bn-bars-w");
            this.bar.style.removeProperty("--fikra-bn-list-bg");
        }
        (this.links || []).forEach((a) => a.classList.remove("is-current"));
        if (this.main) {
            this.main.classList.remove("has-current");
        }
        (this.words || []).forEach((w) => w.classList.remove("is-on"));
        (this.subs || []).forEach((s) => {
            s.classList.toggle("is-open", (this._serverOpen || []).includes(s));
        });
        if (this.subsWrap) {
            this.subsWrap.classList.toggle("has-open", !!this._serverHasOpen);
        }
        this._super(...arguments);
    },
});

export default publicWidget.registry.FikraHeaderBig;
