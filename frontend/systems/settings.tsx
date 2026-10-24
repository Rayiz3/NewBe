import { Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { useAccountStore } from './account';
import Constants from 'expo-constants';

export const APP_VERSION = Constants.expoConfig?.version ?? '—';

export function openSettings() { router.push('/settings-page'); }
export function openPrivacy() { router.push('/privacy-page'); }
export function openServiceInfo() { router.push('/service-info-page'); }
export function openAbout() { router.push('/about-page'); }
export function confirmAccountDeletion() {
    if (!useAccountStore.getState().isLogin || useAccountStore.getState().isLoading) return;
    Alert.alert('뉴비 계정을 삭제할까요?',
        '프로필, 맞춤 피드와 모든 스크랩이 영구 삭제되며 복구할 수 없어요. Google 계정은 삭제되지 않아요.', [
            { text: '취소', style: 'cancel' },
            { text: '계정 삭제', style: 'destructive', onPress: () => { void useAccountStore.getState().deleteAccount(); } },
        ]);
}
export async function openServiceLink(url: string) {
    if (!/^https:\/\//i.test(url) && !/^mailto:[^\s@]+@[^\s@]+$/.test(url)) {
        Alert.alert('안내', '연락처와 공개 페이지를 준비하고 있어요.');
        return;
    }
    try { await Linking.openURL(url); }
    catch { Alert.alert('링크를 열 수 없어요', '잠시 후 다시 시도해 주세요.'); }
}
