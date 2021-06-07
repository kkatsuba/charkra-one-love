import React, { useEffect } from "react";
import {
  MenuProps,
  MenuItemProps,
  Menu as ChakraMenu,
  MenuItem as ChakraMenuItem,
  MenuList as ChakraMenuList,
  useMenuContext,
  chakra,
  useStyles,
  useMenuItem,
  MenuListProps,
  MenuDescendantsProvider,
  MenuProvider,
  omitThemingProps,
  useMenu,
} from "@chakra-ui/react";
import { ChevronRightIcon } from '@chakra-ui/icons';

class RootMenu {
  menus = new Map<string, ReturnType<typeof useMenuContext>>()

  closeAllMenus() {
    Array.from(this.menus).forEach(([,menu]) => menu.onClose())
  }

  registerMenu(menuId: string, parentMenu: ReturnType<typeof useMenuContext>) {
    this.menus.set(menuId, parentMenu)
  }
}

const RootMenuContext = React.createContext<RootMenu | undefined>(undefined)

export const Menu: React.FC<MenuProps> = (props) => {
  const root = React.useMemo(() => new RootMenu(), [])

  useEffect(() => {
    const handleClose = (event: MouseEvent) => {
      if (event.target) {
        const clickOnMenu = Array.from(root.menus).some(([, menu]) => {
          // @ts-ignore
          return menu.menuRef.current?.contains(event.target)
        })

        const clickOnButton = Array.from(root.menus).some(([, menu]) => {
          // @ts-ignore
          return menu.buttonRef.current?.contains(event.target)
        })

        if (!clickOnMenu && !clickOnButton) {
          root.closeAllMenus()
        }
      }
    }

    document.addEventListener('click', handleClose)
    return () => document.removeEventListener('click', handleClose)
  }, [])

  return (
    <RootMenuContext.Provider value={root}>
      <ChakraMenu {...props} />
    </RootMenuContext.Provider>
  );
}

export const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  (props, ref) => {
    const root = React.useContext(RootMenuContext)
    const { onClick } = props;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      root?.closeAllMenus();
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

const useMenuToggle = (options: MenuProps) => {
  const {
    isOpen: isOpenProp,
    onClose: onCloseProp,
    onOpen: onOpenProp,
  } = options

  const isControlled = isOpenProp !== undefined
  const [isOpen, setIsOpen] = React.useState(isOpenProp ?? false)

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

  return {
    isOpen,
    onClose,
    onOpen,
  }
}

const useSuBMenu = (props: MenuProps) => {
  const parentMenu = useMenuContext()
  const toggleMenuProps = useMenuToggle(props)
  const { descendants, ...ctx } = useMenu({
    ...omitThemingProps(props),
    ...toggleMenuProps,
  })
  const context = React.useMemo(() => ctx, [ctx])
  const root = React.useContext(RootMenuContext)

  useEffect(() => {
    if (parentMenu) {
      root?.registerMenu(context.menuId, parentMenu)
    }
  }, [context, parentMenu])

  return { descendants, context }
}

export const SubMenu: React.FC<MenuProps> = (props) => {
  const styles = useStyles()
  const menuitemProps = useMenuItem({ closeOnSelect: false })
  const { context, descendants } = useSuBMenu(props)
  const { isOpen, onClose, onOpen } = context

  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isOpen) {
      onOpen()
    }
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keysMap: any = {
      ArrowLeft: () => {
        onClose()

        // to prevent close of all sub menus (only when target != currentTarget)
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
      sx={styles.subMenu}
      __css={styles.item}
      data-active={isOpen ? '' : undefined}
      onKeyDown={onKeyDown}
      onClick={onClick}
    >
      <MenuDescendantsProvider value={descendants}>
        <MenuProvider value={context}>
          {props.children}
        </MenuProvider>
      </MenuDescendantsProvider>
      <ChevronRightIcon />
    </chakra.div>
  )
}

export const MenuList: React.FC<MenuListProps> = (props) => {
  const { menuId, isOpen, openAndFocusFirstItem } = useMenuContext()
  const parentMenu= React.useContext(RootMenuContext)?.menus.get(menuId)
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
