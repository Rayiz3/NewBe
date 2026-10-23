import { Text } from 'react-native';
import { SettingsLayout, SettingsRow, SettingsSection, settingsStyles } from '@/components/SettingsLayout';
import { useAccountStore } from '@/systems/account';
import { confirmAccountDeletion, openPrivacy, openServiceInfo } from '@/systems/settings';

export default function SettingsPage() {
    const isLogin = useAccountStore(s => s.isLogin);
    const busy = useAccountStore(s => s.isLoading);
    const logout = useAccountStore(s => s.logout);
    const login = useAccountStore(s => s.login);
    return <SettingsLayout title="설정">
        <SettingsSection title="내 계정 관리">
            {isLogin ? <>
                <SettingsRow title="로그아웃" onPress={() => void logout()} disabled={busy} busy={busy} />
                <SettingsRow title="계정 삭제" description="프로필, 맞춤 피드와 모든 스크랩을 영구 삭제해요."
                    danger onPress={confirmAccountDeletion} disabled={busy} />
            </> : <SettingsRow title="Google로 로그인" description="로그인하면 계정을 관리할 수 있어요."
                onPress={() => void login()} disabled={busy} busy={busy} />}
            {busy ? <Text accessibilityLiveRegion="polite" style={settingsStyles.note}>계정 요청을 처리하고 있어요.</Text> : null}
        </SettingsSection>
        <SettingsSection title="서비스 안내">
            <SettingsRow title="개인정보처리방침" onPress={openPrivacy} />
            <SettingsRow title="서비스 정보 · 문의" description="뉴스 출처 안내와 운영자 연락처" onPress={openServiceInfo} />
        </SettingsSection>
    </SettingsLayout>;
}
