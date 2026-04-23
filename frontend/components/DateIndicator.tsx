import { fontSize, scale } from "@/constants/sizes";
import { shadowStyle } from "@/constants/typography";
import { Text } from "@react-navigation/elements";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export default function DateIndicator() {
    const [currentDate, setCurrentDate] = useState("");

    useEffect(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const week = ["일", "월", "화", "수", "목", "금", "토"][now.getDay()];

        const formatted = `${year}.${month}.${day} (${week})`;
        setCurrentDate(formatted);
    }, []);

    return (
        <Text style={[styles.dateText, shadowStyle]}>{currentDate || "2026.mm.dd (w)"}</Text>
    );
}

const styles = StyleSheet.create({
    dateText: {
        position: "absolute",
        top: scale(140),
        zIndex: 10,
        fontFamily: "Pretendard",
        fontSize: fontSize.mainBody,
        fontWeight: 500,
        color: colors.light.text,
    },
});