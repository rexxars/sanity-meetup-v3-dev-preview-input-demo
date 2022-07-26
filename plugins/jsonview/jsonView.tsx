import {Code, Inline, Stack, Switch, Text} from '@sanity/ui'
import {useState} from 'react'
import {createPlugin, useCurrentUser} from 'sanity'
import {PortableTextInput, PortableTextInputProps} from 'sanity/form'

/**
 * - Implement `renderInput` - notice that even _document_ is an input
 * - Check for document type, render default if so
 */
export const jsonView = createPlugin({
  name: 'json-view',
  form: {
    renderInput(props, next) {
      if (props.schemaType.type?.name === 'document') {
        return next(props)
      }

      return <div>INPUT!</div>
    },
  },
})

function JsonView(props: PortableTextInputProps) {
  const [showJson, setShowJson] = useState(false)
  const user = useCurrentUser()
  const userIsDeveloper = user?.roles.some((role) => role.name === 'developer')

  if (!userIsDeveloper) {
    return <PortableTextInput {...props} />
  }

  return (
    <Stack space={2}>
      <Inline space={2} style={{textAlign: 'right'}}>
        <Switch checked={showJson} onChange={() => setShowJson((current) => !current)} />
        <Text>Show JSON</Text>
      </Inline>

      {showJson ? (
        <Code language="json">{JSON.stringify(props.value, null, 2)}</Code>
      ) : (
        <PortableTextInput {...props} />
      )}
    </Stack>
  )
}
