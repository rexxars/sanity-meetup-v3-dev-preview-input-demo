import {createConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {jsonView} from './plugins/jsonview/jsonView'
import {schemaTypes} from './schemas'

export default createConfig({
  name: 'default',
  title: 'MeetupDemo',

  projectId: 'd3o6sbwv',
  dataset: 'production',

  plugins: [deskTool(), jsonView({allowEditing: true})],

  schema: {
    types: schemaTypes,
  },
})
