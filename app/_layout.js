import { SplashScreen, Stack, router } from "expo-router";
import { View, StatusBar, StyleSheet, Image, Pressable } from "react-native";
import { createRef, useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { ui } from "../src/utils/styles";
import { getAllFavorites, initDb } from "../src/utils/storage";
import { DataContext } from "../src/utils/DataContext";
import AdsHandler from "../src/components/AdsHandler";

SplashScreen.preventAutoHideAsync();

export default function Layout() {

    // Carga de fuentes.
    const [fontsLoaded] = useFonts({
        "Regular": require("../assets/fonts/OpenRunde-Regular.otf"),
        "Medium": require("../assets/fonts/OpenRunde-Medium.otf"),
        "Semibold": require("../assets/fonts/OpenRunde-Semibold.otf"),
        "Bold": require("../assets/fonts/OpenRunde-Bold.otf"),
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded])

    useEffect(() => {
        init();
    }, []);

    async function init() {
        await initDb();
    }

    const [favorites, setFavorites] = useState([]);
    useEffect(() => {
        async function getFavorites() {
            const result = await getAllFavorites();
            if (result) setFavorites(result);
        }
        getFavorites();
    }, [])


    // Gestión de anuncios
    const [adTrigger, setAdTrigger] = useState(0);
    const adsHandlerRef = createRef();

    useEffect(() => {
        if (adTrigger > 5) {
            adsHandlerRef.current.showIntersitialAd();
            setAdTrigger(0);
        }
    }, [adTrigger])


    // Esperar hasta que las fuentes se carguen
    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <AdsHandler ref={adsHandlerRef} adType={[0]} />
            <DataContext.Provider value={{ favorites: favorites, setFavorites: setFavorites, setAdTrigger: setAdTrigger }}>
                <Stack />
                <Pressable onPress={() => router.push("/favorites")} style={ui.floatingWrapper}>
                    <Image style={ui.floatingImg} source={require("../assets/favorites.png")} />
                </Pressable>
            </DataContext.Provider>
            <StatusBar style="light" />
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
        justifyContent: "center",
        marginTop: StatusBar.currentHeight,
    },
    wrapper: {
        flex: 1,
        width: "100%",
        alignSelf: "center",
        justifyContent: "center",
    }
})