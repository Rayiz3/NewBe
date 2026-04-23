import { IMAGES } from "@/constants/data"
import { space } from "@/constants/sizes"
import { usePersonaStore } from "@/systems/persona"
import { useEffect, useRef } from "react"
import { Image, Pressable, StyleSheet, View } from "react-native"

type Props = {
    personaId: string
    location: 'feed' | 'persona'
    index?: number
}

export default function Token({personaId, location, index=-1}: Props) {
    const feed = usePersonaStore(s => s.feed);
    const curPersona = usePersonaStore(s => s.curPersona);
    const setCurPersona = usePersonaStore(s => s.setCurPersona);
    const setIsDragging = usePersonaStore(s => s.setIsDragging);
    const setDrag = usePersonaStore(s => s.setDrag);
    const setFeedPosX = usePersonaStore(s => s.setFeedPosX);
    const feedPosX = usePersonaStore(s => s.feedPosX);

    const tokenRef = useRef<View>(null);

    const handleLongPressOn = () => {
        setIsDragging(location);
    }

    const handlePressOn = (id: string) => {
        setCurPersona(id);
        tokenRef.current?.measureInWindow((x, y, w, h) => {
            setDrag(x + w/4, y + h);
        });
    };

    useEffect(() => {
        if (location == 'feed' && index >= 0) {
            tokenRef.current?.measureInWindow((x, y, w, h) => {
                setFeedPosX(x + w/2, index)
            });
        };
    }, [feed]);

    return (
        <Pressable
            key={`${location}-${personaId}`}
            style={location==="persona"? styles.personaWrapper : styles.tokenWrapper}
            delayLongPress={400}
            onPressIn={() => handlePressOn(personaId)}
            onLongPress={() => handleLongPressOn()}>
            <View ref={tokenRef}>
                <Image
                    source={IMAGES[personaId][personaId === curPersona? "TOKEN_SELECT" : "TOKEN"]}
                    style={location==="persona"? styles.persona : styles.token}
                    resizeMode="contain" />
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
  personaWrapper: {
    width: space.menuTokenSize,
    height: space.menuTokenSize,
    justifyContent: "center",
    alignItems: "center",
  },
  persona: {
    width: space.menuTokenSize,
    height: space.menuTokenSize,
  },
  tokenWrapper: {
    width: space.feedTokenSize,
    height: space.feedTokenSize,
    justifyContent: "center",
    alignItems: "center",
  },
  token: {
    width: space.feedTokenSize,
    height: space.feedTokenSize,
  },
})