import {Code, Inline, Stack, Switch, Text} from '@sanity/ui'
import {ReactNode, useState} from 'react'
import {createPlugin, InputProps, isObjectSchemaType, useCurrentUser} from 'sanity'

/**
 * - Add hovering state with visual feedback
 */
export const jsonView = createPlugin({
  name: 'json-view',
  form: {
    renderInput(props, next) {
      if (props.schemaType.type?.name === 'document') {
        return next(props)
      }

      if (isObjectSchemaType(props.schemaType)) {
        return next(props)
      }

      return <JsonView {...props}>{next(props)}</JsonView>
    },
  },
})

function JsonView(props: InputProps & {children: ReactNode}) {
  const [showJson, setShowJson] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const user = useCurrentUser()
  const userIsDeveloper = user?.roles.some((role) => role.name === 'developer')

  if (!userIsDeveloper) {
    return <>{props.children}</>
  }

  return (
    <Stack
      space={2}
      onMouseOver={() => setIsHovering(true)}
      onMouseOut={() => setIsHovering(false)}
    >
      <Inline space={2} style={{textAlign: 'right'}}>
        <Switch checked={isHovering} onChange={() => setShowJson((current) => !current)} />
        <Text>Show JSON</Text>
      </Inline>

      {showJson ? (
        <Code language="json">{JSON.stringify(props.value, null, 2)}</Code>
      ) : (
        props.children
      )}
    </Stack>
  )
}
