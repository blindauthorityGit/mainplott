import {MdHome, MdWeb, MdSettings} from 'react-icons/md' // Icons for the Pages and Global Components
import {GoHome} from 'react-icons/go' // Icon for individual pages like Start Page

export default (S) =>
  S.list()
    .title('Content')
    .items([
      // Define the "Pages" category with a unique ID
      S.listItem()
        .title('Pages')
        .id('pagesCategory') // Explicitly setting a unique ID for the Pages category
        .icon(MdHome)
        .child(
          S.list()
            .title('Pages')
            .id('pagesList') // Explicitly setting a unique ID for the Pages list
            .items([
              S.listItem()
                .title('Start Page')
                .id('startPageItem') // Explicitly setting a unique ID for the Start Page list item
                .icon(GoHome)
                .child(
                  S.document()
                    .schemaType('startPage') // Reference the "startPage" schema
                    .documentId('singleton-startPage'), // Singleton ID for the start page
                ),
              S.listItem()
                .title('About Page')
                .id('aboutPageItem') // Explicitly setting a unique ID for the About Page list item
                .icon(GoHome)
                .child(
                  S.document()
                    .schemaType('aboutPage') // Reference the "aboutPage" schema
                    .documentId('singleton-aboutPage'), // Singleton ID for the about page
                ),
            ]),
        ),
      // Define the "Global Components" category with a unique ID
      S.listItem()
        .title('Global Components')
        .id('globalComponents') // Explicitly setting a unique ID for the Global Components category
        .icon(MdWeb)
        .child(
          S.list()
            .title('Global Components')
            .id('globalComponentsList') // Explicitly setting a unique ID for the Global Components list
            .items([
              S.listItem()
                .title('Features')
                .id('featuresItem') // Explicitly setting a unique ID for the Features list item
                .icon(GoHome)
                .child(
                  S.document()
                    .schemaType('featuresSingleton') // Reference the "featuresSingleton" schema
                    .documentId('singleton-features'), // Singleton ID for features
                ),
              S.listItem()
                .title('Testimonials')
                .id('testimonialsSingletonItem') // Explicitly setting a unique ID for the Testimonials list item
                .icon(GoHome)
                .child(
                  S.document()
                    .schemaType('testimonialsSingleton') // Reference the "testimonialsSingleton" schema
                    .documentId('singleton-testimoinial'), // Singleton ID for testimonials
                ),
              S.listItem()
                .title('FAQs')
                .id('faqsSingletonItem') // Explicitly setting a unique ID for the FAQs list item
                .icon(GoHome)
                .child(
                  S.document()
                    .schemaType('faqsSingleton') // Reference the "faqsSingleton" schema
                    .documentId('singleton-faqs'), // Singleton ID for FAQs
                ),
              S.listItem()
                .title('Settings') // Singleton for Settings
                .id('settingsSingletonItem')
                .icon(MdSettings) // Icon for Settings
                .child(
                  S.document()
                    .schemaType('settingsSingleton') // Reference the "settingsSingleton" schema
                    .documentId('singleton-settings'), // Singleton ID for Settings
                ),
            ]),
        ),
      S.divider(),
      // Filter out singletons from the default document list
      ...S.documentTypeListItems().filter(
        (listItem) =>
          ![
            'startPage',
            'aboutPage',
            'featuresSingleton',
            'testimonialsSingleton',
            'faqsSingleton',
            'settingsSingleton',
          ].includes(listItem.getId()), // Exclude the singleton items from the default document list
      ),
    ])
