const { withAndroidManifest, withMainActivity, withInfoPlist } = require('expo/config-plugins');

module.exports = function withPhonePortrait(config) {
    config = withAndroidManifest(config, config => {
        const activities = config.modResults.manifest.application[0].activity;
        const main = activities.find(activity => activity.$['android:name'] === '.MainActivity');
        if (main) main.$['android:screenOrientation'] = 'unspecified';
        return config;
    });
    config = withMainActivity(config, config => {
        if (config.modResults.language !== 'kt') throw new Error('Phone orientation requires Kotlin MainActivity');
        const marker = '// NewBe phone portrait lock';
        if (config.modResults.contents.includes(marker)) return config;
        const anchor = 'super.onCreate(null)';
        if (!config.modResults.contents.includes(anchor)) throw new Error('MainActivity onCreate anchor not found');
        config.modResults.contents = config.modResults.contents.replace(anchor, `${anchor}
    ${marker}
    requestedOrientation = if (resources.configuration.smallestScreenWidthDp < 600)
      android.content.pm.ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
    else android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED`);
        return config;
    });
    return withInfoPlist(config, config => {
        config.modResults.UISupportedInterfaceOrientations = ['UIInterfaceOrientationPortrait'];
        config.modResults['UISupportedInterfaceOrientations~ipad'] = [
            'UIInterfaceOrientationPortrait', 'UIInterfaceOrientationPortraitUpsideDown',
            'UIInterfaceOrientationLandscapeLeft', 'UIInterfaceOrientationLandscapeRight',
        ];
        return config;
    });
};
