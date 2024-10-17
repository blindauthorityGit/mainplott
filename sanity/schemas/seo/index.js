import {FaSearch} from 'react-icons/fa'

export default {
  name: 'seo',
  title: 'SEO',
  type: 'object',
  icon: FaSearch,
  collapsable: true,
  collapsed: false,
  fields: [
    {
      name: 'mainSEO',
      title: 'Main SEO',
      type: 'object',
      fields: [
        /* your fields here */ {
          name: 'title',
          title: 'Title',
          type: 'string',
          required: true,
          description: 'Titel für SEO, erscheint in Google und im Browser Tab',
        },
        {
          name: 'description',
          title: 'Description',
          type: 'text',
          required: true,
          description:
            'Beschreibungstext für SEO, erscheint in Google unter dem Titel. 140 Zeichen.',
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          description: 'Keywords für Suchmaschine, optional',

          of: [
            {
              type: 'string',
            },
          ],
        },
        {
          name: 'author',
          title: 'Author',
          type: 'string',
          description: 'Author der Seite, optional.',
        },
      ],
    },
    {
      name: 'advancedSEO',
      title: 'Advanced SEO',
      type: 'object',
      fields: [
        /* your fields here */ {
          name: 'ogTitle',
          title: 'OG Title',
          type: 'string',
          description: 'Titel für Social Media Share Links (zB Facebook)',
        },
        {
          name: 'ogDescription',
          title: 'OG Description',
          type: 'text',
          description: 'Beschreibung für Social Media Share Links (zB Facebook). 140 Zeichen',
        },
        {
          name: 'ogImage',
          title: 'OG Image',
          type: 'image',
          description: 'Hauptbild für Social Media Share Links (zB Facebook)',
        },
        {
          name: 'canonical',
          title: 'Canonical URL',
          type: 'url',
          description: 'Optionaler Link für Crawler',
        },
      ],
    },
  ],
}
