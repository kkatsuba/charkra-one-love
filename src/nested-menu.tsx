import React, { useEffect } from "react";
import {
  MenuProps,
  MenuItemProps,
  Menu as ChakraMenu,
  MenuItem as ChakraMenuItem,
  MenuList as ChakraMenuList,
  MenuButton as ChakraMenuButton,
  useMenuContext,
  MenuButtonProps,
  chakra,
  useStyles,
  useMenuItem,
  MenuListProps,
} from "@chakra-ui/react";

console.clear();

type NestedMenuContextProps = ReturnType<typeof useMenuContext>

const NestedMenuContext = React.createContext<NestedMenuContextProps | undefined>(undefined);

export const Menu: React.FC<MenuProps> = (props) => {
  const nestedMenuContext = React.useContext(NestedMenuContext);
  const parentMenuContext = useMenuContext();
  const context = (nestedMenuContext || parentMenuContext) && {
    ...parentMenuContext,
    onClose: () => {
      nestedMenuContext && nestedMenuContext.onClose();
      parentMenuContext?.onClose();
    }
  };

  return (
    <NestedMenuContext.Provider value={context}>
      <ChakraMenu {...props} />
    </NestedMenuContext.Provider>
  );
}


export const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  (props, ref) => {
    const { onClose, closeOnSelect } =
      React.useContext(NestedMenuContext) || {};
    const { onClick } = props;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      closeOnSelect && onClose?.();
      onClick?.(event);
    };

    return <ChakraMenuItem ref={ref} {...props} onClick={handleClick} />;
  }
);

export const NestedMenu: React.FC<MenuProps> = (props) => {
  const styles = useStyles()
  const {
    isOpen: isOpenProp,
    onClose: onCloseProp,
    onOpen: onOpenProp,
    ...rest
  } = props
  const isControlled = isOpenProp !== undefined
  const [isOpen, setIsOpen] = React.useState(isOpenProp ?? false)
  const menuitemProps = useMenuItem({ ...rest, closeOnSelect: false })

  useEffect(() => {
    if (isOpenProp !== undefined) {
      setIsOpen(isOpenProp)
    }
  }, [isOpenProp])

  const onOpen = React.useCallback(() => {
    if (!isControlled) {
      setIsOpen(true)
    }
    onOpenProp?.()
  }, [isControlled])

  const onClose = React.useCallback(() => {
    if (!isControlled) {
      setIsOpen(false)
    }
    onCloseProp?.()
  }, [isControlled])


  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const map: any = {
      37: () => { // FIXME key codes
        onClose()

        // to prevent close of all nested menus (only when target != currentTarget)
        if (event.target !== event.currentTarget) {
          event.stopPropagation()
        }
      }, // left
      39: onOpen, // right
      32: () => {
        if (event.target === event.currentTarget && !isOpen) {
          onOpen()
        }
      },
      13: onOpen, // enter
    }

    const handler = map[event.keyCode]
    if (handler) {
      handler()
      event.defaultPrevented = true;
    }
  }

  return (
    <chakra.div
      sx={styles.nestedMenu}
      {...menuitemProps}
      onKeyDown={onKeyDown}
      __css={{
        textDecoration: "none",
        color: "inherit",
        userSelect: "none",
        display: "flex",
        width: "100%",
        alignItems: "center",
        textAlign: "start",
        flex: "0 0 auto",
        outline: 0,
        ...styles.item,
      }}
      onClick={(e) => (e.defaultPrevented = true)}
    >
      <Menu {...props} isOpen={isOpen} onClose={onClose} onOpen={onOpen} />
    </chakra.div>
  )
}


// TODO remove
export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  (props, ref) => {
    return (
      <ChakraMenuButton ref={ref} {...props} />
    );
  }
);

export const MenuList: React.FC<MenuListProps> = (props) => {
  const { isOpen, openAndFocusFirstItem } = useMenuContext()
  const parentMenu= React.useContext(NestedMenuContext);
  const [focusedIndex, setFocusedIndex] = React.useState(-1) // need to store focus index of parent menu

  useEffect(() => {
    if (parentMenu && isOpen) {
      setFocusedIndex(parentMenu.focusedIndex)
      parentMenu.setFocusedIndex(-1)
      openAndFocusFirstItem()
    }

    if (parentMenu && !isOpen) {
      parentMenu.setFocusedIndex(focusedIndex)
    }
  }, [isOpen])

  return <ChakraMenuList {...props} />
}
