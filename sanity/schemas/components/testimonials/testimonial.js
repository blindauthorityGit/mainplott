// schemas/testimonial.js
export default {
  name: 'testimonial',
  title: 'Testimonial',
  type: 'object',
  fields: [
    {
      name: 'text',
      title: 'Testimonial Text',
      type: 'array',
      of: [{type: 'block'}], // Rich text field for the testimonial
    },
  ],
}
