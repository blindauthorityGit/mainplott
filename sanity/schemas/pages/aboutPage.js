// schemas/startPage.js
export default {
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Page Title',
      type: 'string',
    },
    {
      name: 'slider',
      title: 'Slider',
      type: 'slider', // Custom slider type defined in a separate schema
    },
  ],
}
