// deskStructure.js

import {
  MdHome,
  MdWeb,
  MdSettings,
  MdGavel,
  MdAssignment,
  MdSecurity,
  MdAutoFixHigh,
  MdCollections, // ← for Portfolio Items
} from 'react-icons/md'
import {GoHome} from 'react-icons/go'

import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'

export default (S, context) =>
  S.list()
    .title('Content')
    .items([
      // --- Pages ---
      S.listItem()
        .title('Pages')
        .id('pagesCategory')
        .icon(MdHome)
        .child(
          S.list()
            .title('Pages')
            .id('pagesList')
            .items([
              S.listItem()
                .title('Start Page')
                .id('startPageItem')
                .icon(GoHome)
                .child(S.document().schemaType('startPage').documentId('singleton-startPage')),
              S.listItem()
                .title('About Page')
                .id('aboutPageItem')
                .icon(GoHome)
                .child(S.document().schemaType('aboutPage').documentId('singleton-aboutPage')),
              S.documentTypeListItem('servicePage').title('Service Pages').icon(MdWeb),
              S.listItem()
                .title('Kontakt')
                .id('kontaktItem')
                .icon(MdGavel)
                .child(S.document().schemaType('kontaktPage').documentId('singleton-kontakt')),
              S.listItem()
                .title('Vektorisierung')
                .id('vektorItem')
                .icon(MdAutoFixHigh)
                .child(S.document().schemaType('vektorPage').documentId('singleton-vektor')),
              S.listItem()
                .title('Impressum')
                .id('impressumItem')
                .icon(MdGavel)
                .child(S.document().schemaType('impressumPage').documentId('singleton-impressum')),
              S.listItem()
                .title('AGB')
                .id('agbItem')
                .icon(MdAssignment)
                .child(S.document().schemaType('agbPage').documentId('singleton-agb')),
              S.listItem()
                .title('Widerruf')
                .id('widerrufItem')
                .icon(MdAssignment)
                .child(S.document().schemaType('widerrufPage').documentId('singleton-widerruf')),
              S.listItem()
                .title('Datenschutz')
                .id('datenschutzItem')
                .icon(MdSecurity)
                .child(
                  S.document().schemaType('datenschutzPage').documentId('singleton-datenschutz'),
                ),
            ]),
        ),

      // --- Global Components ---
      S.listItem()
        .title('Global Components')
        .id('globalComponents')
        .icon(MdWeb)
        .child(
          S.list()
            .title('Global Components')
            .id('globalComponentsList')
            .items([
              S.listItem()
                .title('Features')
                .id('featuresItem')
                .icon(GoHome)
                .child(
                  S.document().schemaType('featuresSingleton').documentId('singleton-features'),
                ),
              S.listItem()
                .title('Testimonials')
                .id('testimonialsSingletonItem')
                .icon(GoHome)
                .child(
                  S.document()
                    .schemaType('testimonialsSingleton')
                    .documentId('singleton-testimonials'),
                ),
              S.listItem()
                .title('FAQs')
                .id('faqsSingletonItem')
                .icon(GoHome)
                .child(S.document().schemaType('faqsSingleton').documentId('singleton-faqs')),
              S.listItem()
                .title('Settings')
                .id('settingsSingletonItem')
                .icon(MdSettings)
                .child(
                  S.document().schemaType('settingsSingleton').documentId('singleton-settings'),
                ),
              S.listItem()
                .title('Shop')
                .id('shopItem')
                .icon(MdSettings)
                .child(S.document().schemaType('shop').documentId('shop')),
            ]),
        ),

      // --- Portfolio Items (non-singleton) ---
      // S.listItem()
      //   .title('Portfolio Items')
      //   .id('portfolioItems')
      //   .icon(MdCollections)
      //   .schemaType('portfolioItem')
      //   .child(S.documentTypeList('portfolioItem').title('Portfolio Items')),

      // Portfolio Items mit Sortieransicht
      orderableDocumentListDeskItem({
        type: 'portfolioItem',
        title: 'Portfolio Items',
        icon: MdCollections,
        id: 'orderable-portfolio',
        S,
        context, // <-- MUSS hier mit rein!
      }),

      S.divider(),

      // …and finally the rest of your “automatic” list,
      // filtering out all your singleton types so you don’t see duplicates:
      ...S.documentTypeListItems().filter(
        (listItem) =>
          ![
            'servicePage',
            'shop',
            'startPage',
            'aboutPage',
            'impressumPage',
            'datenschutzPage',
            'widerrufPage',
            'kontaktPage',
            'agbPage',
            'featuresSingleton',
            'testimonialsSingleton',
            'faqsSingleton',
            'settingsSingleton',
            'vektorPage',
            'portfolioItems',
            'portfolioItem',
          ].includes(listItem.getId()),
      ),
    ])
