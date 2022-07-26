import {Card, Code} from '@sanity/ui'
import {InputProps} from 'sanity'

/**
 * - Typed input props! Hooray!
 * - Use syntax highlighting through @sanity/ui's `<Code />`
 */
export function JsonView(props: InputProps) {
  return (
    <Card>
      <Code language="json">{JSON.stringify(props.value, null, 2)}</Code>
    </Card>
  )
}
