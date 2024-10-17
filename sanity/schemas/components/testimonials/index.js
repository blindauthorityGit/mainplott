// schemas/testimonialsSingleton.js
export default {
  name: 'testimonialsSingleton',
  title: 'Testimonials',
  type: 'document',
  fields: [
    {
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [{type: 'testimonial'}], // Array of individual testimonial elements
    },
  ],
}
