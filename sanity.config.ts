import {createConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {moreKokos} from './plugins/moreKokos/moreKokosPlugin'
import {schemaTypes} from './schemas'

export default createConfig({
  name: 'default',
  title: 'MeetupDemo',

  projectId: 'd3o6sbwv',
  dataset: 'production',

  plugins: [deskTool(), moreKokos()],

  schema: {
    types: schemaTypes,
  },
})
