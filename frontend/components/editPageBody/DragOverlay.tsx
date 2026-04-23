import { IMAGES } from "@/constants/data";
import { space } from "@/constants/sizes";
import { usePersonaStore } from "@/systems/persona";
import { Image } from "react-native";

export default function DragOverlay() {
  const curPersona = usePersonaStore(s => s.curPersona);
  const drag = usePersonaStore(s => s.drag);

    return (
        <Image
            source={IMAGES[curPersona]["TOKEN"]}
            style={{
                position: "absolute",
                left: drag.x - space.feedTokenSize * 0.5,
                top: drag.y - space.feedTokenSize * 0.5,
                width: space.menuTokenSize,
                height: space.menuTokenSize,
                opacity: 0.45,
                zIndex: 999,
            }}
            resizeMode="contain" />
    )
}