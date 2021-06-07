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
import { ChevronRightIcon } from '@chakra-ui/icons';

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
    const { onClose, closeOnSelect } = React.useContext(NestedMenuContext) || {};
    const { onClick } = props;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // close all sub-menus when click on item
      closeOnSelect && onClose?.();
      onClick?.(event);
    };

    const onKeyUp = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === ' ') { // allow to select sub-menu item with space
        event.stopPropagation()
      }
    }

    return <ChakraMenuItem ref={ref} {...props} onClick={handleClick} onKeyUpCapture={onKeyUp} />
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


  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isOpen) {
      onOpen()
    }
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keysMap: any = {
      ArrowLeft: () => {
        onClose()

        // to prevent close of all nested menus (only when target != currentTarget)
        if (event.target !== event.currentTarget) {
          event.stopPropagation()
        }
      },
      ArrowRight: onOpen,
      Enter: onOpen,
    }

    const handler = keysMap[event.key]
    if (handler) {
      handler()
      event.defaultPrevented = true;
    }
  }

  return (
    <chakra.div
      {...menuitemProps}
      sx={styles.nestedMenu}
      __css={styles.item}
      data-active={isOpen ? '' : undefined}
      onKeyDown={onKeyDown}
      onClick={onClick}
    >
      <Menu {...props} isOpen={isOpen} onClose={onClose} onOpen={onOpen} />
      <ChevronRightIcon />
    </chakra.div>
  )
}

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
