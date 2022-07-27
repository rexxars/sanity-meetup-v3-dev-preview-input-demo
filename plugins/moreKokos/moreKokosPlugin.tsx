import {createPlugin} from 'sanity'
import {MoreKokosInput} from './MoreKokosInput'

export const moreKokos = createPlugin({
  name: 'more-kokos',
  form: {
    renderInput(props: any, next) {
      return props.schemaType.type?.name === 'text' ? (
        <MoreKokosInput {...props}>{next(props)}</MoreKokosInput>
      ) : (
        next(props)
      )
    },
  },
})
