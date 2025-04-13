const { Arch } = require('electron-builder');

let shouldNotarize = process.platform === 'darwin';

if (shouldNotarize) {
  if (!process.env.APPLE_TEAM_ID) {
    shouldNotarize = false;
    console.warn('No APPLE_TEAM_ID environment variable set, notarization will be skipped');
  }

  if (!process.env.APPLE_ID) {
    shouldNotarize = false;
    console.warn('No APPLE_ID environment variable set, notarization will be skipped');
  }

  if (!process.env.APPLE_APP_SPECIFIC_PASSWORD) {
    shouldNotarize = false;
    console.warn('No APPLE_APP_SPECIFIC_PASSWORD environment variable set, notarization will be skipped');
  }
}

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: 'com.akiver.csdm',
  copyright: 'Copyright © 2014-present AkiVer',
  productName: 'CS Demo Manager',
  publish: {
    provider: 'github',
  },
  fileAssociations: {
    ext: 'dem',
    name: 'DEM',
    description: 'CS demo file',
    role: 'Viewer',
  },
  win: {
    target: {
      target: 'nsis',
      arch: ['x64'],
    },
    executableName: 'cs-demo-manager',
    extraFiles: [
      {
        from: 'build-assets/bin/csdm.cmd',
        to: './csdm.cmd',
      },
    ],
    extraResources: [
      {
        from: './static',
        to: 'static',
        filter: ['!**/*.so', '!**/*.dylib'],
      },
    ],
  },
  mac: {
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64'],
      },
      {
        // It's important to also generate zip files otherwise the auto-update will fail.
        // See https://github.com/electron-userland/electron-builder/issues/6058
        target: 'zip',
        arch: ['x64', 'arm64'],
      },
    ],
    category: 'public.app-category.developer-tools',
    appId: 'com.akiver.csdm',
    notarize: shouldNotarize,
    extraResources: [
      // From https://developer.apple.com/forums/thread/128166
      // > IMPORTANT Scripts are not considered code.
      // > If you have scripts — shell, Python, AppleScript, or whatever — place them in the resources directory.
      // > These will still be signed, but as a resource rather than as code.
      //
      // Trying with extraFiles would result in the following error as it's considered as nested code:
      // Command failed: codesign --sign XXX --force --timestamp ./dist/mac-arm64/CS Demo Manager.app/Contents/MacOS/CS Demo Manager
      // ./dist/mac-arm64/CS Demo Manager.app/Contents/MacOS/CS Demo Manager: replacing existing signature
      // ./dist/mac-arm64/CS Demo Manager.app/Contents/MacOS/CS Demo Manager: code object is not signed at all
      // In subcomponent: ./dist/mac-arm64/CS Demo Manager.app/Contents/csdm
      {
        from: 'build-assets/bin/csdm_darwin.sh',
        to: './csdm',
      },
      {
        from: './static',
        to: 'static',
        filter: ['!**/*.dll', '!**/*.exe', '!**/*.so'],
      },
    ],
  },
  linux: {
    executableName: 'cs-demo-manager',
    target: [
      { target: 'deb', arch: ['x64'] },
      { target: 'rpm', arch: ['x64'] },
      { target: 'AppImage', arch: ['x64'] },
    ],
    icon: 'build-assets/icon.icns',
    extraFiles: [
      {
        from: 'build-assets/bin/csdm.sh',
        to: './csdm',
      },
    ],
    extraResources: [
      {
        from: './static',
        to: 'static',
        filter: ['!**/*.dll', '!**/*.exe', '!**/*.dylib'],
      },
    ],
  },
  directories: {
    output: 'dist',
    buildResources: 'build-assets',
  },
  files: [
    'package.json',
    {
      from: 'out',
      to: '.',
    },
  ],
  beforePack: async (context) => {
    const { installBoilerWritter, installCounterStrikeVoiceExtractor, installDemoAnalyzer } = await import(
      './scripts/install-deps.mjs'
    );
    const arch = Arch[context.arch];
    const platform = context.packager.platform.nodeName;
    await Promise.all([
      installDemoAnalyzer(platform, arch),
      installBoilerWritter(platform, arch),
      installCounterStrikeVoiceExtractor(platform),
    ]);
  },
};

module.exports = config;
