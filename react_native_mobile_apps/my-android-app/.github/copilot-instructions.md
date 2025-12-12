# Simple Meditation App - AI Coding Agent Instructions

## Project Overview

This is a React Native meditation and affirmations app built with Expo SDK 54, using file-based routing (Expo Router) and NativeWind v2 for styling. The app features guided meditation with audio playback and affirmations galleries.

## Architecture & Navigation

### Routing Structure (Expo Router)

- **Entry point:** `app/index.tsx` - splash/welcome screen that routes to `/meditate`
- **Root layout:** `app/_layout.tsx` - imports `global.css` for NativeWind, configures Stack navigator
- **Tab navigation:** `app/(tabs)/_layout.tsx` - bottom tabs for `meditate` and `affirmations`
- **Dynamic routes:**
  - `app/meditation/[id].tsx` - individual meditation session (audio player)
  - `app/affirmations/[itemId].tsx` - individual affirmation details

Navigation uses `useRouter()` from `expo-router`. Replace navigation: `router.replace('/meditate')`. Push navigation: `router.push(\`/meditation/${id}\`)`.

## Styling System

### NativeWind v2 Setup

- **Config:** `tailwind.config.js` scans `app/**` and `components/**`
- **Babel plugin:** `babel.config.js` includes `'nativewind/babel'` (must be before reanimated plugin)
- **Global styles:** Imported in `app/_layout.tsx` via `import './global.css'`
- **Usage:** Use `className` prop with Tailwind classes: `className="flex-1 bg-white rounded-xl"`

### Common Patterns

- Gradients: Use `LinearGradient` from `expo-linear-gradient` with rgba colors
- Safe areas: Wrap screens in `SafeAreaView` from `react-native-safe-area-context`
- Layout wrapper: `AppGradient` component combines `LinearGradient` + `SafeAreaView`

## Data & Assets Pattern

### Asset Organization

Images and audio are organized by feature:

- `assets/meditation-images/` - meditation backgrounds (webp format)
- `assets/affirmation-images/` - affirmation category images
- `assets/audio/` - meditation audio files (mp3)

### Constants Structure

**Pattern:** Separate data from UI, use typed constants with asset mappings

1. **Meditation data** (`constants/MeditationData.ts`):
   - `MEDITATION_DATA` array with `{id, title, image, audio}` (strings reference filenames)
   - `AUDIO_FILES` object maps filenames to `require()` statements for audio
   - `MEDITATION_IMAGES` (`constants/meditation-images.ts`) maps filenames to imported images

2. **Affirmations data** (`constants/affirmations-gallery.ts`):
   - Array of categories with nested `data` arrays
   - Each item has `{id, text, image}` where image is directly imported
   - Use `AFFIRMATION_GALLERY.map()` to render galleries

**Why this pattern:** Expo requires assets to be statically analyzable at build time. The mapping objects (`AUDIO_FILES`, `MEDITATION_IMAGES`) bridge dynamic string references to static `require()` calls.

## Component Patterns

### Reusable Components

- **`CustomButton`:** Touchable with title, accepts `containerStyles` and `textStyles` (Tailwind classes)
- **`AppGradient`:** Screen wrapper accepting `colors` array and `children`
- **`GuidedAffirmationsGallery`:** Horizontal FlatList with navigation via `<Link href={\`/affirmations/${item.id}\`} asChild>`
- **`CompletionModal`:** Modal displayed on meditation completion with session stats

### Image Handling

- Use `ImageBackground` for full-screen backgrounds with `resizeMode="cover"`
- Layer `LinearGradient` over backgrounds for text readability
- Import images: `import beachImage from '@/assets/meditation-images/beach.webp'`

## Audio Playback (expo-av)

Pattern in `app/meditation/[id].tsx`:

```typescript
const [sound, setSound] = useState<Audio.Sound | null>(null);

// Load and play with looping
const { sound: newSound } = await Audio.Sound.createAsync(
  AUDIO_FILES[audioFilename],
  { shouldPlay: false, isLooping: true }
);
await newSound.playAsync();

// Track progress
useEffect(() => {
  if (!sound) return;
  const updateProgress = async () => {
    const status = await sound.getStatusAsync();
    if (status.isLoaded && status.durationMillis) {
      const progress = (status.positionMillis / status.durationMillis) * 100;
      setAudioProgress(progress);
    }
  };
  const interval = setInterval(updateProgress, 500);
  return () => clearInterval(interval);
}, [sound, isPlaying]);

// Cleanup
useEffect(() => {
  return sound
    ? () => {
        sound.unloadAsync();
      }
    : undefined;
}, [sound]);
```

## Meditation Timer Features

- **Duration options:** `[5, 10, 15, 20, 30]` minutes via `DURATION_OPTIONS` constant
- **Timer controls:** Increase/decrease buttons (disabled while playing)
- **Progress indicators:**
  - Circular progress ring around timer
  - Audio playback progress bar
- **Completion detection:** Shows `CompletionModal` when timer reaches 0
- **Reset functionality:** Stops audio, resets timer, clears progress

## Path Aliases

`tsconfig.json` configures `"@/*"` to resolve to project root and `app/` directory. Use for imports: `import CustomButton from '@/components/CustomButton'`.

## Development Workflow

### Running the App

- Start: `npx expo start` or `npm start`
- Android: Press `a` in terminal or `npm run android`
- iOS: Press `i` in terminal or `npm run ios`
- Web: Press `w` in terminal or `npm run web`

### Clear Cache (if styles not updating)

```bash
npx expo start -c
```

### Linting

```bash
npm run lint
```

## Key Dependencies

- `expo-router` - File-based routing (v6)
- `nativewind` - Tailwind CSS for React Native (v2.0.11)
- `expo-av` - Audio/video playback
- `expo-linear-gradient` - Gradient backgrounds
- `react-native-reanimated` - Animations (plugin required in babel.config.js)

## Color System

Colors defined in `constants/Colors.ts`:

- `primary`: `#0a4d4a` (teal, used for tab active tint)
- `grey`: `#5e5d5e`
- `dark`: `#1a1a1a`

Gradients use inline rgba arrays, not constants.

## Testing & Debugging

The project includes `app-example/` directory - reference implementation from Expo. Not part of the active app but useful for pattern examples.
