# -*- coding: utf-8 -*-
{
    'name': "Fikra Blocks",
    'summary': "Blocs de design supplémentaires pour le website builder",
    'description': """
Bibliothèque de snippets Fikra Digital
======================================
Blocs réutilisables sur tous les projets clients : bandeaux défilants,
apparitions au scroll, cartes travaillées, compteurs animés.
    """,
    'author': "Fikra Digital",
    'website': "https://fikra-digit.com",
    'category': 'Website/Website',
    'version': '18.0.1.0.0',
    'license': 'LGPL-3',

    # website est indispensable : on étend son éditeur
    'depends': ['website'],

    'data': [
        'views/snippets/s_fikra_marquee.xml',
        'views/snippets/snippets.xml',
        'views/snippets/options.xml',
    ],

    'assets': {
        'web.assets_frontend': [
            'fikra_blocks/static/src/scss/s_fikra_marquee.scss',
        ],
    },

    'installable': True,
    'application': False,
}
