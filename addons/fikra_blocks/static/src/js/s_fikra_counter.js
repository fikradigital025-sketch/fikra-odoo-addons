/** @odoo-module **/

/**
 * Compteurs animés — Fikra Blocks
 * ---------------------------------------------------------------------------
 * Un publicWidget est le mécanisme d'Odoo pour attacher du comportement à un
 * bloc côté site public. `selector` désigne l'élément : Odoo instancie le
 * widget automatiquement partout où il apparaît, y compris sur les blocs
 * ajoutés dans l'éditeur.
 *
 * `disabledInEditableMode = true` empêche l'animation de se déclencher pendant
 * l'édition — sinon les chiffres repartiraient de zéro à chaque clic, ce qui
 * rendrait le bloc impossible à modifier.
 *
 * L'animation utilise IntersectionObserver (détecte l'entrée dans l'écran) et
 * requestAnimationFrame (synchronisé avec le rafraîchissement de l'écran).
 * Aucune bibliothèque externe.
 */

import publicWidget from "@web/legacy/js/public/public_widget";

const DURATION = 1800;          // durée du comptage, en millisecondes

// Courbe d'accélération : départ rapide, ralentissement à l'approche de la
// valeur finale. Plus naturel qu'une progression linéaire.
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

publicWidget.registry.FikraCounter = publicWidget.Widget.extend({
    selector: ".s_fikra_counter",
    disabledInEditableMode: true,

    start() {
        this.observers = [];
        const items = this.el.querySelectorAll(".s_fikra_counter_value");

        // Respecte le réglage système « réduire les animations » : on laisse
        // simplement la valeur finale déjà présente dans le HTML.
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) {
            return this._super(...arguments);
        }

        items.forEach((el) => {
            const target = parseFloat(el.dataset.target);
            if (isNaN(target)) {
                return;             // valeur non numérique : on laisse tel quel
            }

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            observer.unobserve(el);   // une seule fois
                            this._animate(el, target);
                        }
                    });
                },
                { threshold: 0.4 }    // déclenche quand 40% du chiffre est visible
            );

            observer.observe(el);
            this.observers.push(observer);
        });

        return this._super(...arguments);
    },

    /**
     * Anime un compteur de 0 jusqu'à sa valeur cible.
     */
    _animate(el, target) {
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";
        const decimals = (el.dataset.target.split(".")[1] || "").length;
        const start = performance.now();

        const step = (now) => {
            const progress = Math.min((now - start) / DURATION, 1);
            const value = target * easeOutCubic(progress);

            el.textContent =
                prefix +
                value.toLocaleString("fr-FR", {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals,
                }) +
                suffix;

            if (progress < 1) {
                this.rafId = requestAnimationFrame(step);
            }
        };

        this.rafId = requestAnimationFrame(step);
    },

    /**
     * Nettoyage : sans ça, les observateurs et l'animation continueraient de
     * tourner après la destruction du widget (navigation, sortie de l'éditeur).
     */
    destroy() {
        this.observers?.forEach((o) => o.disconnect());
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        this._super(...arguments);
    },
});

export default publicWidget.registry.FikraCounter;