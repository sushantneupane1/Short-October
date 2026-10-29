# 11:11 PM — October Theory

A cinematic, text-driven interactive story. No character art or video playback; the experience is built from typography, timing, and optional audio.

## Run on Windows 11
1. Extract the project folder.
2. Open the folder in VS Code.
3. Install the **Live Server** extension, or use any local HTTP server.
4. Right-click `index.html` and choose **Open with Live Server**.
5. Click **Begin listening**.

Do not rely on opening `index.html` as a `file://` URL: the app fetches `data/story.json`, which browsers may block when opened directly.

## Story
The current `data/story.json` contains the supplied story arranged as dialogue beats. You can edit text and timing there. Each beat has a `type`, `text`, and optional `pauseAfter` duration in seconds. After a line finishes revealing, this duration holds back the continue cue; readers can still click or press Space/Enter to move on immediately. Empty `silence` beats hold for their duration and then continue automatically.

Supported visual beat types include:
- `narration`
- `thought`
- `stage`
- `silence`
- `whisper`
- `final`
- `end`

## Audio
Add local files under:
- `audio/music/`
- `audio/ambience/`
- `audio/sfx/`

The supplied Floating Trees track and summer night cricket ambience are bundled in audio/music/ and audio/ambience/. Both loop during the story and have separate volume controls.

## Controls
- Click the story area, Space, or Enter: reveal/advance
- Undo: return to the previous sentence
- Pause/Resume: stop and continue at the exact text reveal position
- Settings button: open listening settings
- M: mute/unmute
- Settings: adjust channel volumes, text reveal mode, and reduced motion

## Notes
This is a starter implementation. Test the scene flow, accessibility, and audio cues after making edits. The scene engine can be extended to support richer per-beat audio commands, save/resume, and desktop packaging once the browser build is stable.

## Dramatic pacing ideas for this story
- Keep the specific physical details (the clock, the last open chat, the thumb hovering over the keyboard) close to the emotional lines. Small actions give the audience something concrete to picture.
- Let “I never asked her” and “Goodnight, Sisaaa” sit in silence. Their longer pauses are now set in `story.json`; adjust them by ear rather than making every line equally slow.
- Consider adding one brief remembered message from their earlier conversations before the final farewell. A real, ordinary detail can make the loss feel more personal than another paragraph explaining the bond.
- Preserve the uncertainty of the ending. The final “END…?” and 11:11 wish already create a strong afterimage; avoid adding an explanation after them.



## Included music

The supplied Floating Trees MP3 is included at audio/music/floating-trees.mp3. It starts looping after the opening narration, as the story moves into the boy's thoughts. Music and Night ambience both default to 20%; use Listening settings to adjust them. Previously saved browser settings take precedence over these defaults.


The supplied summer night cricket recording is included at audio/ambience/summer-night-crickets.mp3. It loops with the Night ambience volume setting when the story starts.

Music follows a few marked emotional beats in `data/story.json`. A beat's optional `musicLevel` is a multiplier of the listener's Music setting: `0.4` fades the music to 40% of their chosen level, while `1` restores it. Changes fade smoothly over about 1.4 seconds; ambience stays steady.

