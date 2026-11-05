/** @odoo-module **/

/**
 * Toggle navbar - Fikra Blocks
 * ---------------------------------------------------------------------------
 * The logo turns into a 3-bar icon on CLICK (not hover). The vertical page
 * list unfolds right below it, inside the page flow, with no floating panel.
 * A second click on the bars folds it back and restores the logo.
 *
 * The widget is disabled in the editor: without it, the list stays visible
 * so every page link remains editable. On the live site the widget adds
 * `o_fikra_nav_ready`, which folds the list until the logo is clicked.
 */

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.FikraNavToggle = publicWidget.Widget.extend({
    selector: ".s_fikra_nav_toggle",
    disabledInEditableMode: true,

    start() {
        this.brand = this.el.querySelector(".s_fikra_nav_brand");
        this.el.classList.add("o_fikra_nav_ready");

        if (this.brand) {
            this._onClick = this._onClick.bind(this);
            this.brand.addEventListener("click", this._onClick);
        }
        return this._super(...arguments);
    },

    _onClick(ev) {
        // Let the actual page links in the open list behave normally.
        if (ev.target.closest(".s_fikra_nav_list")) {
            return;
        }
        // In the header the logo is a home link; a click must toggle, not
        // navigate. Harmless for the body-block navbar (plain-text logo).
        ev.preventDefault();
        this.el.classList.toggle("o_fikra_nav_open");
    },

    destroy() {
        if (this.brand) {
            this.brand.removeEventListener("click", this._onClick);
        }
        this.el.classList.remove("o_fikra_nav_ready", "o_fikra_nav_open");
        this._super(...arguments);
    },
});

export default publicWidget.registry.FikraNavToggle;
