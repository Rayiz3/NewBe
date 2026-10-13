import { router } from "expo-router";
import { useAccountStore } from "./account";

export function goBack() { router.back(); }
export function openMainMenu(name: string) {
    router.push(name === '편집' ? '/edit-page' : '/menu-page');
}
export function runMenuAction(name: string) {
    if (name === '편집') router.push('/edit-page');
    else if (name === '스크랩') router.push('/scrap-page');
    else if (name === '로그아웃') useAccountStore.getState().setIsLogin(false);
}
