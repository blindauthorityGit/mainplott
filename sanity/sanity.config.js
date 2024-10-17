import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import deskStructure from './deskStructure' // Import the desk structure

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
  ],

  schema: {
    types: schemaTypes,
  },
})
