import React from "react";
import {
  MenuProps,
  MenuItemProps,
  Menu as ChakraMenu,
  MenuItem as ChakraMenuItem,
  MenuButton as ChakraMenuButton,
  useMenuContext,
  MenuButtonProps,
  useMenuDescendantsContext
} from "@chakra-ui/react";

console.clear();

type NestedMenuContextProps = ReturnType<typeof useMenuContext> & {
  descendants: ReturnType<typeof useMenuDescendantsContext>
}

const NestedMenuContext = React.createContext<NestedMenuContextProps | undefined>(undefined);

export const Menu: React.FC<MenuProps> = (props) => {
  const nestedMenuContext = React.useContext(NestedMenuContext);
  const parentMenuContext = useMenuContext();
  const descendants = useMenuDescendantsContext()
  const context = (nestedMenuContext || parentMenuContext) && {
    ...parentMenuContext,
    descendants,
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
    return <ChakraMenuItem ref={ref} closeOnSelect={false} {...props} />;
  }
);

export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  (props, ref) => {
    const nestedMenuContext = React.useContext(NestedMenuContext);

    const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      props.onKeyDown?.(event);
      if (nestedMenuContext) {
        const { descendants, focusedIndex, setFocusedIndex } = nestedMenuContext
        const map = {
          27: () => {}, //esc
          38: () => {
            const prev = descendants.prevEnabled(focusedIndex)
            if (prev) setFocusedIndex(prev.index)
          }, // left
          40: () => {
            const next = descendants.nextEnabled(focusedIndex)
            if (next) setFocusedIndex(next.index)
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
