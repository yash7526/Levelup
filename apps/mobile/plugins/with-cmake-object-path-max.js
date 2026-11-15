/**
 * Expo config plugin: make CMake shorten long object-file paths in Android native builds.
 *
 * Why: React Native compiles library C++ into object files whose paths embed the full
 * source path, e.g.
 *   …\.cxx\…\CMakeFiles\react_codegen_x.dir\C_\Users\…\node_modules\x\…\File.cpp.o
 * On Windows these exceed the 260-character limit and Ninja fails with
 * "Filename longer than 260 characters". CMake hashes object paths longer than
 * CMAKE_OBJECT_PATH_MAX, but it only sets that limit when *targeting* Windows — when
 * targeting Android it is effectively unlimited, even on a Windows host. Setting it for
 * every Android module fixes the build and is harmless on macOS/Linux.
 *
 * Hooked from settings.gradle via `gradle.beforeProject`, so it is registered before any
 * module is evaluated (Expo's root plugin evaluates some modules early, which makes hooks
 * in the root build.gradle too late). Applied at prebuild, so it survives regenerating the
 * git-ignored `android/` folder.
 */
const { withSettingsGradle } = require("expo/config-plugins");

const MARKER = "// [levelup] cmake-object-path-max";
const LIMIT = 240;

const SNIPPET = `
${MARKER} (managed by plugins/with-cmake-object-path-max.js)
gradle.beforeProject { project ->
  ["com.android.application", "com.android.library"].each { pluginId ->
    project.plugins.withId(pluginId) {
      project.androidComponents.finalizeDsl { extension ->
        extension.defaultConfig.externalNativeBuild.cmake.arguments.add("-DCMAKE_OBJECT_PATH_MAX=${LIMIT}")
      }
    }
  }
}
`;

module.exports = function withCmakeObjectPathMax(config) {
  return withSettingsGradle(config, (modConfig) => {
    const settingsGradle = modConfig.modResults;
    if (settingsGradle.language !== "groovy") {
      throw new Error("with-cmake-object-path-max: expected a Groovy android/settings.gradle");
    }
    if (!settingsGradle.contents.includes(MARKER)) {
      settingsGradle.contents += SNIPPET;
    }
    return modConfig;
  });
};
