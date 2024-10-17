// schemas/textImg.js
export default {
  name: 'textImg',
  title: 'Text & Image',
  type: 'object',
  fields: [
    {
      name: 'richText',
      title: 'Rich Text',
      type: 'array',
      of: [{type: 'block'}], // Rich text field
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true, // Enables image cropping
      },
    },
    {
      name: 'button',
      title: 'Display Button',
      type: 'boolean',
      initialValue: false, // Set to false initially
    },
    {
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      options: {
        list: [
          {title: 'External Link', value: 'external'},
          {title: 'Internal Page', value: 'internal'},
        ], // Dropdown to choose between external and internal link
        layout: 'radio', // Display as radio buttons
      },
      hidden: ({parent}) => !parent?.button, // Only show link options if button is enabled
    },
    {
      name: 'externalLink',
      title: 'External Link',
      type: 'url',
      hidden: ({parent}) => parent?.linkType !== 'external', // Only show if "External Link" is selected
    },
    {
      name: 'internalLink',
      title: 'Internal Page',
      type: 'reference',
      to: [{type: 'startPage'}, {type: 'aboutPage'}], // Add other page types you want to link to
      hidden: ({parent}) => parent?.linkType !== 'internal', // Only show if "Internal Page" is selected
    },
    {
      name: 'buttonText',
      title: 'Button Text',
      type: 'string',
      hidden: ({parent}) => !parent?.button, // Only show if button is enabled
    },
  ],
}
