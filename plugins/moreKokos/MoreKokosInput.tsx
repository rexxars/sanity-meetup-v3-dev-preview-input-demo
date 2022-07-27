import {Button, Stack, Text} from '@sanity/ui'
import {ReactNode, useCallback} from 'react'
import {set, StringInputProps} from 'sanity/form'
import {KokosIcon} from './KokosIcon'

export function MoreKokosInput(props: StringInputProps & {children: ReactNode}) {
  const {value = '', onChange} = props
  const handleMoreKokos = useCallback(
    () => onChange(set(value.trim() + '\nKokos ♥')),
    [value, onChange]
  )
  return (
    <Stack space={2}>
      {props.children}
      <Button icon={KokosIcon} text="More Kokos" mode="ghost" onClick={handleMoreKokos} />
      <Text>Number of hearts: {value.match(/♥/g)?.length || 0}</Text>
    </Stack>
  )
}
