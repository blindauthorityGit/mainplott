// schemas/startPage.js
export default {
  name: 'startPage',
  title: 'Start Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Page Title',
      type: 'string',
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    },
    {
      name: 'slider',
      title: 'Slider',
      type: 'slider', // Custom slider type defined in a separate schema
    },
    {
      name: 'linkBoxes',
      title: 'Link Boxes',
      type: 'array',
      of: [{type: 'linkBox'}], // Array of linkBox components
    },
    {
      name: 'textImageBlocks',
      title: 'Text & Image Blocks',
      type: 'array',
      of: [{type: 'textImg'}], // Array of textImg components
    },
  ],
}
