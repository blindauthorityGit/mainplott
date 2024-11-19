import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import deskStructure from './deskStructure' // Import the desk structure
import {dashboardTool} from '@sanity/dashboard'
import Dashboard from './src/dashboard'

export default defineConfig({
  name: 'default',
  title: 'mainplott',

  projectId: 'sd9ejs77',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: deskStructure, // Use the custom structure file
    }),
    visionTool(),
    dashboardTool({
      widgets: [
        {
          name: 'mainplott-dashboard',
          component: Dashboard,
          layout: {width: 'full'},
        },
      ],
    }),
  ],

  schema: {
    types: schemaTypes,
  },

  tools: (prev) => {
    return [
      ...prev,
      {
        name: 'mainplott-dashboard',
        title: 'Configurator Dashboard',
        component: Dashboard,
      },
    ]
  },
})
