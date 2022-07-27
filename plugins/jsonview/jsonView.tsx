import {Code, Inline, Stack, Switch, Text, TextArea} from '@sanity/ui'
import {
  createContext,
  FormEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {createPlugin, InputProps, isObjectSchemaType, useCurrentUser} from 'sanity'
import {set, unset} from 'sanity/form'
export interface JsonViewOptions {
  allowEditing?: boolean
}

/**
 * - Keep a separate "edit state" for the editor based on initial value + changes
 * - Reset edit value on remote change, in case of multi-user edits
 * - Check for valid JSON when editing (by attempting to parse)
 * - Send patches to update field if JSON is valid
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

const INVALID_VALUE = Symbol.for('INVALID')
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
  const {value, onChange} = props
  const stringifiedValue = stringify(value)

  const showJson = useContext(JsonViewContext)
  const [editValue, setEditValue] = useState(stringifiedValue)
  const onEditorChange = useCallback(
    (evt: FormEvent<HTMLTextAreaElement>) => {
      const newValue = evt.currentTarget.value
      setEditValue(newValue)

      if (newValue.trim() === '') {
        onChange(unset())
        return
      }

      const parsedValue = tryParse(newValue)
      if (parsedValue !== INVALID_VALUE) {
        onChange(set(parsedValue))
      }
    },
    [onChange]
  )

  useEffect(() => {
    setEditValue(stringify(value))
  }, [value])

  if (!showJson) {
    return <>{props.children}</>
  }

  const lines = stringifiedValue.match(/\n/g)?.length || 1

  return props.allowEditing ? (
    <TextArea
      rows={Math.min(lines, 15)}
      style={{fontFamily: 'monospace'}}
      onChange={onEditorChange}
    >
      {editValue}
    </TextArea>
  ) : (
    <Code language="json" style={{whiteSpace: 'pre-wrap'}}>
      {stringifiedValue}
    </Code>
  )
}

function tryParse(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch (err) {
    return INVALID_VALUE
  }
}

function stringify(value: unknown): string {
  return JSON.stringify(value, null, 2)
}
