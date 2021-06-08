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

type MegaMap = {
  [key: string]: {
    self: ReturnType<typeof useMenuContext>,
    parent: ReturnType<typeof useMenuContext>,
    children: Map<string, ReturnType<typeof useMenuContext>>,
  };
}

class RootMenu {
  menusMap: MegaMap = {}

  closeAllMenus() {
    Object.values(this.menusMap).forEach((menuInfo) => {
      menuInfo.self.onClose()
      menuInfo.parent.onClose()
    })
  }

  registerMenu(self: ReturnType<typeof useMenuContext>, parent: ReturnType<typeof useMenuContext>) {
    this.menusMap[self.menuId] = {
      self,
      parent,
      children: this.menusMap[self.menuId]?.children || new Map()
    }

    if (this.menusMap[parent.menuId]) {
      this.menusMap[parent.menuId].children.set(self.menuId, self)
    }
  }

  findAllByParent(parentMenuId: string): string[] {
    const subMenus = this.menusMap[parentMenuId] ? Array.from(this.menusMap[parentMenuId].children) : []

    return subMenus.reduce<string[]>((res, [menuId]) => {
      if (this.menusMap[menuId]) {
        return res.concat(menuId, ...this.findAllByParent(menuId))
      }
      return res.concat(menuId)
    }, [])
  }

  closeByParent(parentMenuId: string) {
    const childIds = this.findAllByParent(parentMenuId)
    childIds.forEach((id) => {
      const menu = this.menusMap[id]
      menu?.self.isOpen && menu?.self.onClose()
    })
  }

  getMenu(menuId: string) {
    return this.menusMap[menuId]
  }
}

const RootMenuContext = React.createContext<RootMenu | undefined>(undefined)

const useRootMenuContext = () => {
  const context = React.useContext(RootMenuContext)
  if (!context) {
    throw new Error('Root menu not provided')
  }

  return context
}

export const Menu: React.FC<MenuProps> = (props) => {
  const root = React.useMemo(() => new RootMenu(), [])
  const ref = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const forceClose = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        root.closeAllMenus()
      }
    }

    const handleClose = async (event: MouseEvent | KeyboardEvent) => {
      // @ts-ignore
      if (event.target && !ref.current?.contains(event.target)) {
        root.closeAllMenus()
      }
    }

    document.addEventListener('click', handleClose)
    document.addEventListener('keyup', forceClose)
    return () => {
      document.removeEventListener('click', handleClose)
      document.removeEventListener('keyup', forceClose)
    }
  }, [])

  return (
    <RootMenuContext.Provider value={root}>
      <chakra.div ref={ref}>
        <ChakraMenu {...props} />
      </chakra.div>
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
  const root = React.useContext(RootMenuContext)
  const parentMenu = useMenuContext()

  const closeAllSubMenus = () => {
    if (root && parentMenu) {
      root.closeByParent(parentMenu.menuId)
    }
  }

  useEffect(() => {
    if (isOpenProp !== undefined) {
      setIsOpen(isOpenProp)
    }
  }, [isOpenProp])

  const onOpen = React.useCallback(() => {
    if (!isControlled && !isOpen) {
      closeAllSubMenus()
      setIsOpen(true)
    }
    onOpenProp?.()
  }, [isControlled, isOpen])

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

  if (parentMenu.menuId.includes('undefined')) {
    console.log('===>>>', parentMenu, parentMenu.buttonRef.current?.innerHTML)
  }

  useEffect(() => {
    if (context && parentMenu) {
      root?.registerMenu(context, parentMenu)
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
  const { parent: parentMenu } = useRootMenuContext().getMenu(menuId) ?? {}
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
