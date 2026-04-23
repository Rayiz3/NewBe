import { Dimensions } from "react-native";

export const screen = Dimensions.get("window");

export const scale = (length: number) => {
    return length * screen.width / 1080;
}

export const fontSize = {
    mainBody: scale(42),
    mainTitle: scale(80),
    menu: scale(28),
    menuBody: scale(32),
    menuTitle2: scale(48),
    menuTitle: scale(60),
}

export const space = {
    borderWidth: 1,
    mainPadding: scale(60),
    contentPadding: scale(40),
    menuHeaderHeight: scale(326),
    menuTokenSize: scale(144),
    feedTokenSize: scale(88),
    mainIconSize: scale(88),
    menuIconSize: scale(108),
}