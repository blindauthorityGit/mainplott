// schemas/faqsSingleton.js
export default {
  name: 'faqsSingleton',
  title: 'FAQs',
  type: 'document',
  fields: [
    {
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [{type: 'faq'}], // Array of individual FAQ elements
    },
  ],
}
