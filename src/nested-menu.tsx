import React, { useEffect, useState } from "react";
import {
  MenuProps,
  MenuItemProps,
  Menu as ChakraMenu,
  MenuItem as ChakraMenuItem,
  MenuButton as ChakraMenuButton,
  useMenuContext,
  MenuButtonProps,
  useMenuDescendantsContext,
  chakra,
  useStyles,
} from "@chakra-ui/react";

console.clear();

type Descendants = ReturnType<typeof useMenuDescendantsContext>

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

export const NestedMenu = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  (props, ref) => {
    const styles = useStyles()
    return <ChakraMenuItem as="div" ref={ref} closeOnSelect={false} {...props} sx={styles.nestedMenu}/>;
  }
);

export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  (props, ref) => {
    const nestedMenuContext = React.useContext(NestedMenuContext)
    const { openAndFocusFirstItem, onClose } = useMenuContext()

    const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      props.onKeyDown?.(event);

      console.log(nestedMenuContext)
      if (nestedMenuContext) {
        const { focusedIndex, setFocusedIndex } = nestedMenuContext
        const map = {
          37: () => {
            onClose()
          }, // left
          39: () => {
            openAndFocusFirstItem()
            // if (descendants) {
            //   const next = descendants.nextEnabled(focusedIndex)
            //   if (next) setFocusedIndex(next.index)
            // }
          }, // right
        }

        // @ts-ignore
        map[event.keyCode]?.()
        event.defaultPrevented = true;
      }
    }

    return (
      <ChakraMenuButton
        ref={ref}
        {...props}
        onKeyDown={onKeyDown}
      />
    );
  }
);
