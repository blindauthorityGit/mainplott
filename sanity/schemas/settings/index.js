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
  ],
}
