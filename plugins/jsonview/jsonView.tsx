import {Code, Inline, Stack, Switch, Text} from '@sanity/ui'
import {useState} from 'react'
import {PortableTextInput, PortableTextInputProps} from 'sanity/form'

/**
 * - Replaced InputProps with PortableTextInputProps
 * - Conditionally render input or JSON based on switch state
 */
export function JsonView(props: PortableTextInputProps) {
  const [showJson, setShowJson] = useState(false)
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
