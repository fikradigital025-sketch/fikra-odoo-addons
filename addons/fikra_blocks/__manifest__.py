# -*- coding: utf-8 -*-
{
    'name': "Fikra Blocks",
    'summary': "Blocs de design supplémentaires pour le website builder",
    'description': """
Bibliothèque de snippets Fikra Digital
======================================
Blocs réutilisables sur tous les projets clients.

Blocs disponibles :
  - Bandeau défilant (marquee)
  - Cartes animées
  - Grille tarifaire
  - Défilement d'images
  - Compteurs animés
  - Cartes-liens
    """,
    'author': "Fikra Digital",
    'website': "https://fikra-digit.com",
    'category': 'Website/Website',
    'version': '18.0.1.5.0',
    'license': 'LGPL-3',

    'depends': ['website'],

    'data': [
        'views/snippets/s_fikra_marquee.xml',
        'views/snippets/s_fikra_cards.xml',
        'views/snippets/s_fikra_pricing.xml',
        'views/snippets/s_fikra_logos.xml',
        'views/snippets/s_fikra_counter.xml',
        'views/snippets/s_fikra_linkcards.xml',
        'views/snippets/snippets.xml',
        'views/snippets/options.xml',
    ],

    'assets': {
        'web.assets_frontend': [
            'fikra_blocks/static/src/scss/s_fikra_marquee.scss',
            'fikra_blocks/static/src/scss/s_fikra_cards.scss',
            'fikra_blocks/static/src/scss/s_fikra_pricing.scss',
            'fikra_blocks/static/src/scss/s_fikra_logos.scss',
            'fikra_blocks/static/src/scss/s_fikra_counter.scss',
            'fikra_blocks/static/src/scss/s_fikra_linkcards.scss',
            'fikra_blocks/static/src/js/s_fikra_counter.js',
        ],
    },

    'installable': True,
    'application': False,
}