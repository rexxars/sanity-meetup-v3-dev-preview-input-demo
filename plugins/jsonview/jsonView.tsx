import CodeMirror from '@uiw/react-codemirror'
import {okaidia} from '@uiw/codemirror-theme-okaidia'
import {json} from '@codemirror/lang-json'
import {Box, Inline, Stack, Switch, Text} from '@sanity/ui'
import {
  createContext,
  FocusEvent,
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
 * - Add CodeMirror for proper editing and syntax highlighting!
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

const codeMirrorExtensions = [json()]
const codeMirrorOptions = {
  autocompletion: false,
  allowMultipleSelections: false,
  lineNumbers: false,
  highlightActiveLineGutter: false,
}

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
  const {value, onChange, onFocus, onBlur, readOnly} = props
  const stringifiedValue = stringify(value)

  const [highlightActiveLine, setHighlightActiveLine] = useState(false)
  const showJson = useContext(JsonViewContext)
  const [editValue, setEditValue] = useState(stringifiedValue)
  const onEditorChange = useCallback(
    (newValue: string) => {
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

  const onEditorFocus = useCallback(
    (evt: FocusEvent) => {
      setHighlightActiveLine(true)
      onFocus(evt)
    },
    [onFocus]
  )

  const onEditorBlur = useCallback(
    (evt: FocusEvent) => {
      setHighlightActiveLine(false)
      onBlur(evt)
    },
    [onBlur]
  )

  useEffect(() => {
    setEditValue(stringify(value))
  }, [value])

  if (!showJson) {
    return <>{props.children}</>
  }

  return (
    <Box>
      <CodeMirror
        value={editValue}
        basicSetup={{...codeMirrorOptions, highlightActiveLine}}
        extensions={codeMirrorExtensions}
        onChange={onEditorChange}
        theme={okaidia}
        onFocus={onEditorFocus}
        onBlur={onEditorBlur}
        readOnly={readOnly || !props.allowEditing}
      />
    </Box>
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
