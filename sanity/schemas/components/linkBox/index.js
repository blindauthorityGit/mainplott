// schemas/linkBox.js
export default {
  name: 'linkBox',
  title: 'Link Box',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true, // Enable cropping
      },
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'image',
    },
    {
      name: 'text',
      title: 'Text',
      type: 'string',
    },
    {
      name: 'link',
      title: 'Link',
      type: 'string',
    },
    {
      name: 'details',
      title: 'Details',
      type: 'string',
    },
  ],
}
