import { Text } from 'react-native';
import { SettingsLayout, SettingsRow, SettingsSection, settingsStyles } from '@/components/SettingsLayout';
import { SERVICE_INFO } from '@/constants/legal';
import { openServiceLink } from '@/systems/settings';

export default function ServiceInfoPage() {
    return <SettingsLayout title="서비스 정보 · 문의">
        <SettingsSection title="뉴스 출처와 요약 안내">
            <Text style={settingsStyles.body}>뉴비는 외부 언론사의 기사를 AI로 요약해 제공해요. 각 요약에 표시된 출처와 ‘본문 보기’에서 원문을 확인할 수 있어요.</Text>
            <Text style={settingsStyles.note}>AI 요약에는 오류나 누락이 있을 수 있어요. 정확한 내용과 맥락은 원문에서 확인해 주세요.</Text>
        </SettingsSection>
        <SettingsSection title="운영자 · 문의">
            <Text selectable style={settingsStyles.body}>운영자: {SERVICE_INFO.operator || '운영자 정보 준비 중'}</Text>
            {SERVICE_INFO.email ? <SettingsRow title={SERVICE_INFO.email} description="서비스 문의 · 요약 오류 제보"
                onPress={() => void openServiceLink(`mailto:${SERVICE_INFO.email}`)} />
                : <Text style={settingsStyles.note}>문의 연락처 준비 중</Text>}
            {SERVICE_INFO.contactUrl ? <SettingsRow title="운영자 연락처 페이지" onPress={() => void openServiceLink(SERVICE_INFO.contactUrl)} /> : null}
            {SERVICE_INFO.deletionUrl ? <SettingsRow title="웹에서 계정 삭제 요청" onPress={() => void openServiceLink(SERVICE_INFO.deletionUrl)} /> : null}
        </SettingsSection>
    </SettingsLayout>;
}
