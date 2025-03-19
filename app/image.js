import { Stack, useLocalSearchParams } from "expo-router";
import { Image as ReactNativeImage, Pressable, StyleSheet, ToastAndroid, View, Alert } from "react-native";
import Header from "../src/components/header";
import { ui } from "../src/utils/styles";
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { bannerId } from "../src/utils/constants";
import { ImageZoom } from '@likashefqet/react-native-image-zoom';

export default function ImageWrapper() {

    const params = useLocalSearchParams();
    const { item } = params;
    const imageName = item.substring(item.lastIndexOf("/") + 1, item.length);

    async function requestPermissions() {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === "granted") {
                downloadImage();
            } else {
                if (Platform.OS === "android") {
                    ToastAndroid.showWithGravityAndOffset(
                        "No tengo permisos para acceder a la galería de su dispositivo",
                        ToastAndroid.LONG,
                        ToastAndroid.BOTTOM,
                        25,
                        50,
                    );
                } else {
                    Alert.alert("No tengo permisos para acceder a la galería de su dispositivo");
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    async function downloadImage() {

        try {
            const { uri } = await FileSystem.downloadAsync(item, FileSystem.documentDirectory + `${imageName}.jpg`);

            // Agregar la imagen al álbum
            const asset = await MediaLibrary.createAssetAsync(uri);

            // Obtener el álbum existente o crearlo
            let album = await MediaLibrary.getAlbumAsync("Diseños de tatuajes");
            if (!album) {
                album = await MediaLibrary.createAlbumAsync("Diseños de tatuajes", asset, true);
            } else {
                await MediaLibrary.addAssetsToAlbumAsync([asset], album, true);
            }

            
            if (Platform.OS === "android") {
                ToastAndroid.showWithGravityAndOffset(
                    "Imagen guardada en tu galería en el albúm «Diseños de tatuajes»",
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                    25,
                    50,
                );
            } else {
                Alert.alert("No tengo permisos para acceder a la galería de su dispositivo");
            }


        } catch (error) {
            console.log(error);
        }
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ header: () => <Header item={item} withFavorite={true} /> }} />
            <BannerAd unitId={bannerId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} />
            <ImageZoom
                onResetAnimationEnd={false}
                minScale={1}
                maxScale={3}
                uri={ item }
                isDoubleTapEnabled
            />
            <Pressable onPress={requestPermissions} style={[ui.floatingWrapper, { left: 15 }]}>
                <ReactNativeImage style={[ui.floatingImg, { marginBottom: 6, marginLeft: 1 }]} source={require("../assets/download.png")} />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },

    image: {
        width: "100%",
        height: "100%",
    }
})