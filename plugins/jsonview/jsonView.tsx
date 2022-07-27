import {Code, Inline, Stack, Switch, Text} from '@sanity/ui'
import {ReactNode, useCallback, useEffect, useState} from 'react'
import {createPlugin, InputProps, isObjectSchemaType, useCurrentUser} from 'sanity'

/**
 * - Add inspect keyboard shortcut listener (Ctrl+I/Meta+I)
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
  const keyDownListener = useCallback(
    (ev: KeyboardEvent) =>
      isHovering &&
      (ev.metaKey || ev.ctrlKey) &&
      ev.key === 'i' &&
      setShowJson((current) => !current),
    [isHovering]
  )

  useEffect(() => {
    window.addEventListener('keydown', keyDownListener)
    return () => window.removeEventListener('keydown', keyDownListener)
  }, [keyDownListener])

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
        <Switch checked={showJson} onChange={() => setShowJson((current) => !current)} />
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
