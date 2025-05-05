// schemas/components/portfolio/portfolio.js
export default {
  name: 'portfolio',
  title: 'Portfolio',
  type: 'object',
  fields: [
    {
      name: 'items',
      title: 'Portfolio Items',
      type: 'array',
      of: [{type: 'portfolioItem'}],
    },
  ],
  preview: {
    select: {
      count: 'items.length',
    },
    prepare(selection) {
      const {count} = selection
      return {
        title: `Portfolio (${count} item${count === 1 ? '' : 's'})`,
      }
    },
  },
}
