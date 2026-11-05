/** @odoo-module **/
// Fikra Portfolio Footer - copy-to-clipboard button for the email address.
// Pure DOM/clipboard, no external library.

import publicWidget from "@web/legacy/js/public/public_widget";

const FikraFooterCopy = publicWidget.Widget.extend({
    selector: ".s_fikra_portfolio_footer",
    events: {
        "click .js_fikra_footer_copy": "_onCopyClick",
    },

    /**
     * Copy the email from the button's data-email attribute and give short
     * visual feedback on the label.
     */
    async _onCopyClick(ev) {
        const btn = ev.currentTarget;
        const email = btn.dataset.email;
        const label = btn.querySelector(".js_fikra_footer_label");
        if (!email || !label) {
            return;
        }
        try {
            await navigator.clipboard.writeText(email);
        } catch {
            // Clipboard API may be unavailable (e.g. non-secure context).
            return;
        }
        const original = label.textContent;
        label.textContent = "Email copié !";
        btn.classList.add("is-copied");
        clearTimeout(this._copyTimer);
        this._copyTimer = setTimeout(() => {
            label.textContent = original;
            btn.classList.remove("is-copied");
        }, 2000);
    },
});

publicWidget.registry.FikraFooterCopy = FikraFooterCopy;

export default FikraFooterCopy;
