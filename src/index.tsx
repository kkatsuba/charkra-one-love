import { Box, Button, ChakraProvider, MenuButton } from "@chakra-ui/react";
import * as React from "react";
import { render } from "react-dom";

import { Menu, MenuItem, SubMenu, MenuList } from "./nested-menu";
import { defaultTheme } from './theme'
import "./styles.css";

const CePizdosMenu = React.forwardRef<HTMLButtonElement, {}>((props, ref) => (
  <SubMenu placement="right-start">
    <MenuButton ref={ref} {...props}>
      Ce pizdos
    </MenuButton>
    <MenuList>
      <MenuItem onClick={() => console.log("chiki briki")}>
        chiki briki
      </MenuItem>
    </MenuList>
  </SubMenu>
));

const KurwaMenu = React.forwardRef<HTMLButtonElement, {}>((props, ref) => (
  <SubMenu placement="right-start">
    <MenuButton ref={ref} {...props}>
      Kurwa
    </MenuButton>
    <MenuList>
      <MenuItem onClick={() => console.log("Pen'onsi")}>
        Pen'onsi
      </MenuItem>
      <CePizdosMenu />
    </MenuList>
  </SubMenu>
));

const OtherNetworks = React.forwardRef<HTMLButtonElement, {}>((props, ref) => (
  <SubMenu placement="right-start">
    <MenuButton ref={ref} {...props}>
      Other
    </MenuButton>
    <MenuList>
      <MenuItem onClick={() => console.log("Twitch")}>
        Twitch
      </MenuItem>
      <MenuItem onClick={() => console.log("Pinterest")}>
        Pinterest
      </MenuItem>
    </MenuList>
  </SubMenu>
));

const NetworksMenu = React.forwardRef<HTMLButtonElement, {}>((props, ref) => {
  return (
    <SubMenu placement="right-start">
      <MenuButton>
        Other Networks
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => console.log("Twitter")}>
          Twitter
        </MenuItem>
        <MenuItem onClick={() => console.log("Facebook")}>
          Facebook
        </MenuItem>
        <OtherNetworks />
        <KurwaMenu />
      </MenuList>
    </SubMenu>
  );
});

export const WithMenu = () => (
  <Menu>
    <MenuButton as={Button}>
      Open menu
    </MenuButton>
    <MenuList>
      <MenuItem command="⌘T" onClick={() => console.log("newTab")}>
        New Tab
      </MenuItem>
      <MenuItem command="⌘N" onClick={() => console.log("newWindow")}>New Window</MenuItem>
      <MenuItem command="⌘⇧N" onClick={() => console.log("open closed tab")}>Open Closed Tab</MenuItem>
      <NetworksMenu />
      <MenuItem command="⌘O" onClick={() => console.log("open file")}>Open File...</MenuItem>
    </MenuList>
  </Menu>
)
function App() {
  return (
    <Box h="100%">
      <WithMenu />
    </Box>
  );
}


const rootElement = document.getElementById("root");
render(
  <ChakraProvider theme={defaultTheme}>
    <App />
  </ChakraProvider>,
  rootElement
);
