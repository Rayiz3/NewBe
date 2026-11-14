import { IMAGES } from "@/constants/data"
import { colors } from "@/constants/colors"
import { fontSize, scale, space } from "@/constants/sizes"
import personas from "@/resources/personas.json"
import { usePersonaToken } from "@/systems/persona"
import { Image, Pressable, StyleSheet, Text, View } from "react-native"

type Props = {
    personaId: string
    location: 'feed' | 'persona'
    index?: number
}

export default function Token({personaId, location, index=-1}: Props) {
    const persona = personas.find(p => p.id === personaId);
    const { tokenRef, curPersona, select, startDragging } = usePersonaToken(personaId, location, index);

    return (
        <Pressable
            key={`${location}-${personaId}`}
            style={location==="persona"? styles.personaWrapper : styles.tokenWrapper}
            delayLongPress={400}
            onPressIn={select}
            onLongPress={startDragging}>
            <View ref={tokenRef} style={location === "feed" ? { width: "100%", aspectRatio: 1 } : undefined}>
                <Image
                    source={IMAGES[personaId][personaId === curPersona? "TOKEN_SELECT" : "TOKEN"]}
                    style={location==="persona"? styles.persona : styles.token}
                    resizeMode="contain" />
            </View>
            {location === 'persona' && (
                <Text style={styles.caption}>{persona?.categoryName}</Text>
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
  personaWrapper: {
    width: space.menuTokenSize,
    justifyContent: "center",
    alignItems: "center",
    gap: scale(12),
  },
  caption: {
    color: colors.black,
    fontSize: fontSize.menuBody,
    fontWeight: "500",
    textAlign: "center",
  },
  persona: {
    width: space.menuTokenSize,
    height: space.menuTokenSize,
  },
  tokenWrapper: {
    width: 48,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  token: {
    width: "100%",
    height: "100%",
  },
})
