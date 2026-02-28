import 'dotenv/config';

export default {
  expo: {
    name: "SYBAR",
    slug: "SYBAR",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/SYBAR-Logo.png",
    scheme: "sybar",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: "com.rt4.sybar",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY_IOS
      },
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    splash: {
      image: "./assets/images/SYBAR-Logo.png",
      resizeMode: "contain",
      backgroundColor: "#FFFFFF"
    },
    android: {
      package: "com.rt4.sybar",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID
        }
      },
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      output: "static",
      favicon: "./assets/images/SYBAR-Logo.png"
    },
    plugins: [
      "@react-native-community/datetimepicker",
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/SYBAR-Logo.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "eff145c2-5375-4639-845c-75c48c3dcc22"
      },
      googleMapsApiKeyAndroid: process.env.GOOGLE_MAPS_API_KEY_ANDROID,
      googleMapsApiKeyIos: process.env.GOOGLE_MAPS_API_KEY_IOS,
    }
  }
};