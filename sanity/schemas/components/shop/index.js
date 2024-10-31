export default {
  name: 'shop',
  title: 'Shop',
  type: 'document',
  fields: [
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'category',
          title: 'Category',
          fields: [
            {
              name: 'name',
              title: 'Category Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'subcategories',
              title: 'Subcategories',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'subcategory',
                  title: 'Subcategory',
                  fields: [
                    {
                      name: 'name',
                      title: 'Subcategory Name',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'value',
                      title: 'Subcategory value',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'icon',
                      title: 'Icon',
                      type: 'image', // You can also make this an 'image' type if you need custom icons
                    },
                    {
                      name: 'subSubcategories',
                      title: 'Sub-Subcategories',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          name: 'subSubcategory',
                          title: 'Sub-Subcategory',
                          fields: [
                            {
                              name: 'name',
                              title: 'Title',
                              type: 'string',
                              validation: (Rule) => Rule.required(),
                            },
                            {
                              name: 'value',
                              title: 'Value',
                              type: 'string',
                              description: 'Description or additional details',
                              validation: (Rule) => Rule.required(),
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
