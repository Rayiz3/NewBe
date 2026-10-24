import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SettingsLayout } from '@/components/SettingsLayout';
import { SERVICE_INFO } from '@/constants/legal';
import { colors } from '@/constants/colors';
import { fontSize, scale } from '@/constants/sizes';
import { APP_VERSION, openServiceLink } from '@/systems/settings';

export default function ServiceInfoPage() {
    return <SettingsLayout title="서비스 정보 · 문의">
        <View style={styles.content}>
            <Text style={styles.body}>앱 이름 : NewBe</Text>
            <Text style={styles.body}>앱 버전 : v{APP_VERSION}</Text>
            <Pressable accessibilityRole="link" accessibilityLabel="이메일로 문의하기"
                disabled={!SERVICE_INFO.email} onPress={() => void openServiceLink(`mailto:${SERVICE_INFO.email}`)}>
                <Text style={styles.body}>문의 : {SERVICE_INFO.email || '문의 연락처 준비 중'}</Text>
            </Pressable>
        </View>
    </SettingsLayout>;
}
const styles = StyleSheet.create({
    content: { paddingHorizontal: scale(50), paddingTop: scale(48) },
    body: { color: colors.black, fontFamily: 'Pretendard', fontSize: fontSize.menuBody,
        fontWeight: '500', lineHeight: scale(60) },
});
