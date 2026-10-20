// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.5.3"),
        .package(name: "CapacitorCommunityBluetoothLe", path: "../../../node_modules/.pnpm/@capacitor-community+blueto_ed267cbc49fe5ed35d33e7c7a1c488ab/node_modules/@capacitor-community/bluetooth-le"),
        .package(name: "CapacitorFilesystem", path: "../../../node_modules/.pnpm/@capacitor+filesystem@8.1.5_@capacitor+core@8.5.3/node_modules/@capacitor/filesystem"),
        .package(name: "CapacitorLocalNotifications", path: "../../../node_modules/.pnpm/@capacitor+local-notifications@8.3.1_@capacitor+core@8.5.3/node_modules/@capacitor/local-notifications"),
        .package(name: "CapacitorPreferences", path: "../../../node_modules/.pnpm/@capacitor+preferences@8.0.1_@capacitor+core@8.5.3/node_modules/@capacitor/preferences"),
        .package(name: "CapacitorShare", path: "../../../node_modules/.pnpm/@capacitor+share@8.0.3_@capacitor+core@8.5.3/node_modules/@capacitor/share"),
        .package(name: "CapacitorStatusBar", path: "../../../node_modules/.pnpm/@capacitor+status-bar@8.0.4_@capacitor+core@8.5.3/node_modules/@capacitor/status-bar")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorCommunityBluetoothLe", package: "CapacitorCommunityBluetoothLe"),
                .product(name: "CapacitorFilesystem", package: "CapacitorFilesystem"),
                .product(name: "CapacitorLocalNotifications", package: "CapacitorLocalNotifications"),
                .product(name: "CapacitorPreferences", package: "CapacitorPreferences"),
                .product(name: "CapacitorShare", package: "CapacitorShare"),
                .product(name: "CapacitorStatusBar", package: "CapacitorStatusBar")
            ]
        )
    ]
)
