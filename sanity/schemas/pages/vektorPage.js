export default {
  name: 'vektorPage',
  title: 'vektor',
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
      type: 'seo', // Assuming you have a custom SEO schema
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{type: 'block'}], // Rich Text Content
      validation: (Rule) => Rule.required(),
    },
  ],
}
