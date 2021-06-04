const parts = ['nestedMenu']

const nestedMenu = () =>{
  return {
    '& > button': {
      w: '100%',
      textAlign: 'left'
    }
  }
}

const baseStyle = (props: Record<string, any>) => ({
  nestedMenu: nestedMenu(),
})

export default {
  parts,
  baseStyle,
}
