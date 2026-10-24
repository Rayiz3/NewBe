import { Text } from 'react-native';
import { SettingsLayout, SettingsRow, SettingsSection, settingsStyles } from '@/components/SettingsLayout';
import { SERVICE_INFO } from '@/constants/legal';
import { openServiceLink } from '@/systems/settings';
import { privacyPolicy } from '@/systems/privacy';

export default function PrivacyPage() {
    return <SettingsLayout title="개인정보처리방침">
        <SettingsSection title="뉴비 개인정보처리방침">
            <Text selectable style={settingsStyles.body}>{privacyPolicy.introduction}</Text>
        </SettingsSection>
        {privacyPolicy.sections.map(section => (
            <SettingsSection key={section.title} title={section.title}>
                <Text selectable style={settingsStyles.body}>{section.body}</Text>
            </SettingsSection>
        ))}
        {SERVICE_INFO.privacyUrl ? <SettingsSection title="공개 웹페이지">
            <SettingsRow title="웹에서 보기" onPress={() => void openServiceLink(SERVICE_INFO.privacyUrl)} />
        </SettingsSection> : null}
    </SettingsLayout>;
}
