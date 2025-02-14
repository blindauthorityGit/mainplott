export default {
  name: 'kontaktPage',
  title: 'Kontakt',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'seo', // Ensure you have a working SEO schema
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{type: 'block'}], // Rich text editor for general content
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'anschrift',
      title: 'Anschrift',
      type: 'array',
      of: [{type: 'block'}], // Rich text for address
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.email().required(),
    },
    {
      name: 'whatsapp',
      title: 'WhatsApp',
      type: 'string',
      description: 'Enter WhatsApp number (with country code, e.g., +49)',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'phone',
      title: 'Phone',
      type: 'string',
      description: 'Enter phone number (with country code, e.g., +49)',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true, // Enables cropping in Sanity
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the image for SEO and accessibility',
        },
      ],
    },
  ],
}
