import { SplashScreen, Stack, router } from "expo-router";
import { View, StatusBar, StyleSheet, Image, Pressable } from "react-native";
import { createRef, useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { ui } from "../src/utils/styles";
import { getAllFavorites, initDb } from "../src/utils/storage";
import { DataContext } from "../src/utils/DataContext";
import AdsHandler from "../src/components/AdsHandler";
import Constants from "expo-constants";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as StoreReview from 'expo-store-review';

SplashScreen.preventAutoHideAsync();

export default function Layout() {

    // Carga de fuentes.
    const [fontsLoaded] = useFonts({
        "Regular": require("../assets/fonts/AncizarSans-Regular.ttf"),
        "Medium": require("../assets/fonts/AncizarSans-Medium.ttf"),
        "Semibold": require("../assets/fonts/AncizarSans-Bold.ttf"),
        "Bold": require("../assets/fonts/AncizarSans-ExtraBold.ttf")
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
    const [adsLoaded, setAdsLoaded] = useState(false);
    const [adTrigger, setAdTrigger] = useState(0);
    const [showOpenAd, setShowOpenAd] = useState(true);
    const adsHandlerRef = createRef();

    useEffect(() => {
        if (adTrigger > 2) {
            setShowOpenAd(false);
            askForReview();
        }

        if (adTrigger > 3) {
            adsHandlerRef.current.showIntersitialAd();
            setShowOpenAd(false);
            setAdTrigger(0);
        }
    }, [adTrigger])

    async function askForReview() {
        if (await StoreReview.hasAction()) {
            StoreReview.requestReview()
        }
    }


    // Esperar hasta que las fuentes se carguen
    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <AdsHandler ref={adsHandlerRef} showOpenAd={showOpenAd} adsLoaded={adsLoaded} setAdsLoaded={setAdsLoaded} setShowOpenAd={setShowOpenAd} />
            <DataContext.Provider value={{ favorites: favorites, setFavorites: setFavorites, setAdTrigger: setAdTrigger, setShowOpenAd: setShowOpenAd, adsLoaded: adsLoaded }}>
                <GestureHandlerRootView style={styles.wrapper}>
                    <Stack />
                </GestureHandlerRootView>
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
    },
    wrapper: {
        flex: 1,
        width: "100%",
        alignSelf: "center",
        justifyContent: "center",
    }
})