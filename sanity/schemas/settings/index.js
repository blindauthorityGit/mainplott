// schemas/settingsSingleton.js
export default {
  name: 'settingsSingleton',
  title: 'Settings',
  type: 'document',
  fields: [
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true, // Enable cropping
      },
    },
    {
      name: 'logoMobile',
      title: 'Mobile Logo',
      type: 'image',
      options: {
        hotspot: true, // Enable cropping
      },
    },
    {
      name: 'contactData',
      title: 'Contact Data',
      type: 'object',
      fields: [
        {
          name: 'phone',
          title: 'Phone',
          type: 'string',
        },
        {
          name: 'email',
          title: 'Email',
          type: 'string',
        },
        {
          name: 'whatsapp',
          title: 'WhatsApp',
          type: 'string',
        },
        {
          name: 'instagram',
          title: 'Instagram',
          type: 'string',
        },
        {
          name: 'facebook',
          title: 'Facebook',
          type: 'string',
        },
      ],
    },
    {
      name: 'businessName',
      title: 'Business Name',
      type: 'string',
    },
    {
      name: 'street',
      title: 'Street',
      type: 'string',
    },
    {
      name: 'city',
      title: 'City',
      type: 'string',
    },
    {
      name: 'menu',
      title: 'Menu',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'category',
          title: 'Category',
          fields: [
            {
              name: 'image',
              title: 'Category Image',
              type: 'image',
              options: {
                hotspot: true, // Enable cropping
              },
            },
            {
              name: 'imageLink',
              title: 'Image Link',
              type: 'string',
            },
            {
              name: 'title',
              title: 'Category Title',
              type: 'string',
            },
            {
              name: 'menuItems',
              title: 'Menu Items',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'menuItem',
                  title: 'Menu Item',
                  fields: [
                    {
                      name: 'image',
                      title: 'Menu Item Image',
                      type: 'image',
                      options: {
                        hotspot: true, // Enable cropping
                      },
                    },
                    {
                      name: 'text',
                      title: 'Menu Item Text',
                      type: 'string',
                    },
                    {
                      name: 'link',
                      title: 'Menu Item Link',
                      type: 'string',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'logos',
      title: 'Logos',
      type: 'array',
      of: [
        {
          type: 'image',
        },
      ],
    },
    {
      name: 'portfolioHeadline',
      title: 'Portfolio Headline',
      type: 'text',
    },
    {
      name: 'liveChat',
      title: 'LiveChat',
      type: 'boolean',
    },
  ],
}
