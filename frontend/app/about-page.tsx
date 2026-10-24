import { Image, StyleSheet, Text, View } from 'react-native';
import { SettingsLayout } from '@/components/SettingsLayout';
import { colors } from '@/constants/colors';
import { fontSize, scale } from '@/constants/sizes';

export default function AboutPage() {
    return <SettingsLayout title="NewBe에 대해서">
        <View style={styles.content}>
            <Image source={require('@/assets/images/about-logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.tagline}>오늘의 소식을, 가장 가볍게</Text>
            <Text style={styles.body}>
                {' NewBe는 매일마다 외부 언론사의 기사를 요약하여 제공하는 AI 기반 뉴스 요약 앱입니다. 각 요약에 표시된 출처와 ‘본문 보기’를 통해 뉴스 기사의 원문을 확인할 수 있습니다.\n\n AI 요약에는 오류나 누락이 있을 수 있습니다. 정확한 내용과 맥락은 원문에서 확인하시는 것을 권장드립니다.'}
            </Text>
        </View>
    </SettingsLayout>;
}
const styles = StyleSheet.create({
    content: { paddingHorizontal: scale(50), paddingTop: scale(48), gap: scale(46), alignItems: 'center' },
    logo: { width: scale(366), height: scale(366) },
    tagline: { color: colors.black, fontFamily: 'Pretendard', fontSize: fontSize.menuTitle2,
        fontWeight: '700', lineHeight: scale(60), textAlign: 'center' },
    body: { alignSelf: 'stretch', color: colors.black, fontFamily: 'Pretendard',
        fontSize: fontSize.menuBody, fontWeight: '500', lineHeight: scale(60) },
});
