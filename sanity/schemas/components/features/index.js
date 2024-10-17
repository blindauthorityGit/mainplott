// schemas/featuresSingleton.js
export default {
  name: 'featuresSingleton',
  title: 'Features',
  type: 'document',
  fields: [
    {
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{type: 'feature'}], // Array of individual feature elements
    },
  ],
}
