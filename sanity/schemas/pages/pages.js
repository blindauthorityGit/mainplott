// schemas/pages.js
export default {
  name: 'pages',
  title: 'Pages',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Page Title',
      type: 'string',
    },
    {
      name: 'pageType',
      title: 'Page Type',
      type: 'reference', // You use a reference here to refer to other schemas
      to: [
        {type: 'startPage'}, // Start Page schema
      ],
    },
  ],
}
