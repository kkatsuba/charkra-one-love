import { Box, Button, ChakraProvider, MenuList } from "@chakra-ui/react";
import * as React from "react";
import { render } from "react-dom";

import { Menu, MenuItem, MenuButton, NestedMenu } from "./nested-menu";
import "./styles.css";

const CePizdosMenu = React.forwardRef<HTMLButtonElement, {}>((props, ref) => (
  <Menu placement="right-start">
    <MenuButton ref={ref} {...props}>
      Ce pizdos
    </MenuButton>
    <MenuList>
      <MenuItem
        onClick={() => {
          console.log("chiki briki");
        }}
      >
        chiki briki
      </MenuItem>
    </MenuList>
  </Menu>
));

const KurwaMenu = React.forwardRef<HTMLButtonElement, {}>((props, ref) => (
  <Menu placement="right-start">
    <MenuButton ref={ref} {...props}>
      Kurwa
    </MenuButton>
    <MenuList>
      <MenuItem
        onClick={() => {
          console.log("twitch");
        }}
      >
        Pen'onsi
      </MenuItem>
      <NestedMenu as={CePizdosMenu} />
    </MenuList>
  </Menu>
));

const OtherNetworks = React.forwardRef<HTMLButtonElement, {}>((props, ref) => (
  <Menu placement="right-start">
    <MenuButton ref={ref} {...props}>
      Other
    </MenuButton>
    <MenuList>
      <MenuItem
        onClick={() => {
          console.log("twitch");
        }}
      >
        Twitch
      </MenuItem>
      <MenuItem>Pinterest</MenuItem>
    </MenuList>
  </Menu>
));

const NetworksMenu = React.forwardRef<HTMLButtonElement, {}>((props, ref) => {
  return (
    <Menu placement="right-start">
      <MenuButton ref={ref} {...props}>
        Other Networks
      </MenuButton>
      <MenuList>
        {/* <MenuItem>Twitter</MenuItem>
        <MenuItem
          onClick={() => {
            console.log("facebook");
          }}
        >
          Facebook
        </MenuItem>
        <NestedMenu as={OtherNetworks} />
        <NestedMenu as={KurwaMenu} /> */}
      </MenuList>
    </Menu>
  );
});

export const WithMenu = () => (
  <Menu>
    <MenuButton as={Button}>
      Open menu
    </MenuButton>
    <MenuList>
      {/* <MenuItem command="⌘T" onClick={() => console.log("newTab")}>
        New Tab
      </MenuItem> */}
      <MenuItem command="⌘N">New Window</MenuItem>
      <MenuItem command="⌘⇧N">Open Closed Tab</MenuItem>
      <NestedMenu as={NetworksMenu} />
      <MenuItem command="⌘O">Open File...</MenuItem>
    </MenuList>
  </Menu>
);

function App() {
  return (
    <Box h="100%">
      <WithMenu />
    </Box>
  );
}

const rootElement = document.getElementById("root");
render(
  <ChakraProvider>
    <App />
  </ChakraProvider>,
  rootElement
);
