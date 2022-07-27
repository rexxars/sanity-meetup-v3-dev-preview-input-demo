import {Code, Inline, Stack, Switch, Text, TextArea} from '@sanity/ui'
import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react'
import {createPlugin, InputProps, isObjectSchemaType, useCurrentUser} from 'sanity'
export interface JsonViewOptions {
  allowEditing?: boolean
}

/**
 * - Add plugin options, and pass it down to JsonView component
 * - Use <TextArea> instead of <Code> if `allowEditing` option is true
 */
export const jsonView = createPlugin((options: JsonViewOptions | void) => ({
  name: 'json-view',
  form: {
    renderInput(props, next) {
      if (props.schemaType.type?.name === 'document') {
        return <DocumentWithJsonViewControl>{next(props)}</DocumentWithJsonViewControl>
      }

      if (isObjectSchemaType(props.schemaType)) {
        return next(props)
      }

      return (
        <JsonView {...props} allowEditing={options?.allowEditing || false}>
          {next(props)}
        </JsonView>
      )
    },
  },
}))

const JsonViewContext = createContext(false)

function DocumentWithJsonViewControl({children}: {children: ReactNode}) {
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

  return (
    <Stack
      space={2}
      onMouseOver={() => setIsHovering(true)}
      onMouseOut={() => setIsHovering(false)}
    >
      {(userIsDeveloper || showJson) && (
        <Inline space={2} style={{textAlign: 'right'}}>
          <Switch checked={showJson} onChange={() => setShowJson((current) => !current)} />
          <Text>Show JSON</Text>
        </Inline>
      )}

      <JsonViewContext.Provider value={showJson}>{children}</JsonViewContext.Provider>
    </Stack>
  )
}

function JsonView(props: InputProps & {children: ReactNode; allowEditing: boolean}) {
  const showJson = useContext(JsonViewContext)

  if (!showJson) {
    return <>{props.children}</>
  }

  const value = stringify(props.value)
  const lines = value.match(/\n/g)?.length || 1

  return props.allowEditing ? (
    <TextArea rows={Math.min(lines, 15)} style={{fontFamily: 'monospace'}}>
      {value}
    </TextArea>
  ) : (
    <Code language="json" style={{whiteSpace: 'pre-wrap'}}>
      {value}
    </Code>
  )
}

function stringify(value: unknown): string {
  return JSON.stringify(value, null, 2)
}
