// schemas/slider.js
export default {
  name: 'slider',
  title: 'Slider',
  type: 'object',
  fields: [
    {
      name: 'slides',
      title: 'Slides',
      type: 'array',
      of: [{type: 'slide'}],
    },
  ],
}
