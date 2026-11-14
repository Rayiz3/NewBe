# Responsive layout

- `constants/sizes.ts` converts the original illustration design units to dp. UI
  typography and controls no longer grow with the width of the device.
- The news pager measures its actual parent, including space reserved for system
  insets, date, and navigation. It repositions the current page after resizing.
- Below 600 dp, illustration space yields to readable content. At 600 dp and
  above, news and illustration share the page horizontally. News spans 76% of the
  page, overlapping two fifths of the nominal 40% illustration region. Navigation
  remains at the bottom in every orientation.
- Short windows and enlarged system fonts get a vertically scrollable page;
  long summaries also scroll within their reading area. Article actions remain
  in normal layout flow instead of covering the last lines.
- Editing, menus and scraps use the full available width. Feed chips scroll
  horizontally. Drag measurements update after
  scrolling or window resizing.
- `plugins/withPhonePortrait.cjs` locks Android phone windows below 600 dp
  smallest width and iPhone to portrait, while tablets retain rotation.
  This native configuration change needs a new build.

## Verification

Run from `frontend`:

```sh
npx tsc --noEmit
node --test tests/responsive-layout.test.cjs
npx eas-cli@latest build --profile preview --platform android
```

Manual matrix for the new APK: 320/360/430 dp phones, phone landscape,
600/800 dp tablet portrait, 960/1280 dp tablet landscape, split screen,
and system font scales 1.0/1.3/2.0. Check main-page swipe and refresh, long
summaries, editing (including drag), signed-in/out menu,
expanded scraps, settings and policy pages. Restore emulator overrides afterward.
