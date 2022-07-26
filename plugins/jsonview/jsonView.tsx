import {Code, Inline, Stack, Switch, Text} from '@sanity/ui'
import {useState} from 'react'
import {useCurrentUser} from 'sanity'
import {PortableTextInput, PortableTextInputProps} from 'sanity/form'

/**
 * - Only render JSON option if users role is a developer
 */
export function JsonView(props: PortableTextInputProps) {
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
