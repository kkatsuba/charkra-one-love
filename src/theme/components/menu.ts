const parts = ['nestedMenu']

const nestedMenu = () =>{
  return {
    '& > button': {
      w: '100%',
      textAlign: 'left'
    },
    textDecoration: "none",
    color: "inherit",
    userSelect: "none",
    display: "flex",
    width: "100%",
    alignItems: "center",
    textAlign: "start",
    flex: "0 0 auto",
    outline: 0,
  }
}

const baseStyle = (props: Record<string, any>) => ({
  nestedMenu: nestedMenu(),
})

export default {
  parts,
  baseStyle,
}
