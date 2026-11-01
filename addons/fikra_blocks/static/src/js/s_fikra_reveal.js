/** @odoo-module **/

/**
 * Révélation au scroll — Fikra Blocks
 * ---------------------------------------------------------------------------
 * Mécanisme partagé : tout bloc dont la section porte la classe
 * `s_fikra_reveal` verra ses enfants `.s_fikra_reveal_item` apparaître un à un
 * quand ils entrent dans l'écran.
 *
 * POINT CRITIQUE — pourquoi le masquage est posé par le JavaScript et non
 * directement en CSS :
 *
 * Si le CSS masquait les éléments par défaut, alors sans JavaScript (erreur,
 * robot d'indexation, et surtout DANS L'ÉDITEUR où les widgets sont désactivés)
 * le contenu resterait invisible pour toujours. Le bloc serait inutilisable.
 *
 * Le JavaScript pose donc d'abord la classe `o_fikra_reveal_ready` sur la
 * section — c'est elle qui active le masquage en CSS. Pas de JavaScript, pas
 * de masquage : tout est visible. L'animation est un bonus, jamais une
 * condition d'affichage.
 */

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.FikraReveal = publicWidget.Widget.extend({
    selector: ".s_fikra_reveal",
    disabledInEditableMode: true,

    start() {
        const items = this.el.querySelectorAll(".s_fikra_reveal_item");
        if (!items.length) {
            return this._super(...arguments);
        }

        // Respecte le réglage système « réduire les animations » : on ne
        // masque rien, on n'anime rien.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return this._super(...arguments);
        }

        // Active le masquage (voir l'explication en tête de fichier)
        this.el.classList.add("o_fikra_reveal_ready");

        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("o_fikra_revealed");
                        this.observer.unobserve(entry.target);   // une seule fois
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
        );

        items.forEach((item, i) => {
            // Décalage en cascade : chaque élément arrive légèrement après le
            // précédent. Plafonné, sinon une longue liste ferait attendre
            // plusieurs secondes avant le dernier.
            item.style.transitionDelay = `${Math.min(i * 90, 450)}ms`;
            this.observer.observe(item);
        });

        return this._super(...arguments);
    },

    destroy() {
        this.observer?.disconnect();
        this.el.classList.remove("o_fikra_reveal_ready");
        this.el.querySelectorAll(".s_fikra_reveal_item").forEach((item) => {
            item.style.transitionDelay = "";
            item.classList.remove("o_fikra_revealed");
        });
        this._super(...arguments);
    },
});

export default publicWidget.registry.FikraReveal;
