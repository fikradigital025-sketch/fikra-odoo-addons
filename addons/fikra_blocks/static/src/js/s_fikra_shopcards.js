/** @odoo-module **/

/**
 * Product cards - Fikra Blocks
 * ---------------------------------------------------------------------------
 * Airbnb-style cards. Each card drives its own image slider (arrows + dots)
 * and a wishlist heart.
 *
 * The slider runs in the editor too, so every slide can be reached and its
 * image replaced. The controls carry contenteditable="false" in the template,
 * which keeps the editor from treating them as text.
 *
 * The number of slides and dots is read from the DOM, so duplicating a slide
 * (and its dot) in the editor is enough to extend a card.
 */

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.FikraShopCards = publicWidget.Widget.extend({
    selector: ".s_fikra_shopcards",

    start() {
        this._cards = [];
        this.el.querySelectorAll(".s_fikra_sc_card").forEach((card) => this._setupCard(card));
        return this._super(...arguments);
    },

    _setupCard(card) {
        const track = card.querySelector(".s_fikra_sc_track");
        const slides = track ? [...track.querySelectorAll(".s_fikra_sc_slide")] : [];
        const dots = [...card.querySelectorAll(".s_fikra_sc_dot")];
        const state = { index: 0, handlers: [] };

        const on = (el, ev, fn) => {
            if (!el) {
                return;
            }
            el.addEventListener(ev, fn);
            state.handlers.push([el, ev, fn]);
        };

        const go = (n) => {
            if (!slides.length || !track) {
                return;
            }
            state.index = (n + slides.length) % slides.length;
            track.style.transform = `translateX(-${state.index * 100}%)`;
            dots.forEach((dot, k) => dot.classList.toggle("is-active", k === state.index));
        };

        const step = (d) => (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            go(state.index + d);
        };

        on(card.querySelector(".s_fikra_sc_prev"), "click", step(-1));
        on(card.querySelector(".s_fikra_sc_next"), "click", step(1));

        dots.forEach((dot, k) => {
            on(dot, "click", (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                go(k);
            });
        });

        const like = card.querySelector(".s_fikra_sc_like");
        on(like, "click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            like.classList.toggle("is-liked");
            const icon = like.querySelector("i");
            if (icon) {
                icon.classList.toggle("fa-heart");
                icon.classList.toggle("fa-heart-o");
            }
        });

        go(0);
        this._cards.push(state);
    },

    destroy() {
        (this._cards || []).forEach((state) => {
            state.handlers.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn));
        });
        this._cards = [];
        this._super(...arguments);
    },
});

export default publicWidget.registry.FikraShopCards;
