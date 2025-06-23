// portfolioItem.js
export default {
  name: 'portfolioItem',
  title: 'Portfolio Item',
  type: 'document',
  fields: [
    {name: 'orderRank', type: 'string', hidden: true}, // <- Wichtig!
    {name: 'label', title: 'Label', type: 'string'},
    {name: 'description', title: 'Description', type: 'text'},
    {name: 'image', title: 'Main Image', type: 'image', options: {hotspot: true}},
    {
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
    },
  ],
  preview: {
    select: {title: 'label', media: 'image'},
  },
  orderings: [
    {
      title: 'Sortierung',
      name: 'orderRankAsc',
      by: [{field: 'orderRank', direction: 'asc'}],
    },
  ],
}
