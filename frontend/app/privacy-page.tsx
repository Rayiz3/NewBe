import { Text } from 'react-native';
import { SettingsLayout, SettingsRow, SettingsSection, settingsStyles } from '@/components/SettingsLayout';
import { PRIVACY_POLICY_TEXT, SERVICE_INFO } from '@/constants/legal';
import { openServiceLink } from '@/systems/settings';

export default function PrivacyPage() {
    return <SettingsLayout title="개인정보처리방침">
        <SettingsSection title="뉴비 개인정보처리방침">
            <Text selectable style={settingsStyles.body}>{PRIVACY_POLICY_TEXT}</Text>
            {SERVICE_INFO.privacyUrl ? <SettingsRow title="웹에서 보기" onPress={() => void openServiceLink(SERVICE_INFO.privacyUrl)} /> : null}
        </SettingsSection>
    </SettingsLayout>;
}
