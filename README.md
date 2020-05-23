# 4chan Sounds Player

A floating player for 4chan sounds threads. 

[Click here to install](https://raw.githubusercontent.com/rcc11/4chan-sounds-player/master/dist/4chan-sounds-player.user.js).

## Sound Player UI

A link to open the player is shown at the top and bottom of the page, next to settings.

![Playlist UI](./images/button-native.png)

#### With 4chan X

Elements of the display, such as icons, are dependent on having 4chan X installed, but it's not a requirement. The icons will fall back to text displays and everything else is purely cosmetic. With it installed the button to open the player is included in the header.

![Playlist UI](./images/button-4chan-x.png)

#### Position/Resizing

The player can be moved by dragging the header and resized by dragging bottom right corner of the footer.

#### Display Modes

The playlist view will list all the sounds in the thread in the order they're playing, with the ability to drag items to modify the order. When hovering over an item the dropdown menu button will show on the right. The menu has an option to remove the item and links to post, image and sound file.

![Playlist UI](./images/playlist.png)

The image only view hides the playlist allowing the image to be expanded.

![Playlist UI](./images/green-tea.png)

## Header Controls
- __Repeat__ - All, One, None
- __Shuffle__ - Shuffled, Ordered (according to the thread)
- __Toggle Playlist__ - Switch between the playlist and image view.
- __Toggle Hover Images__ - Enable/disable image previews when hovering over sounds in the playlist.
- __Reload__ - Check the thread for any sounds not added to the player.
- __Settings__ - Open the settings view.
- __Close__ - Hide the player.

## Settings

- __Allowed Hosts__ - Which hosts the player will add sounds from.
- __Autoshow__ - Open the player automatically for threads that contain sounds.
- __Pause on hide__ - Pauses the player when it's hidden.
- __Hotkeys__ - Hotkeys can be assigned to control the player and playback. They can be always enabled, enabled only when the player is open, or disabled.
- __Footer Contents__ - Custom footer display. `%p` and `%t` are the index of the currently playing sound, and the total number of sounds respectively. Links to the post, image and sound are can be added as `postlink`, `imagelink`, and `soundlink`. The links can optionally be followed by the text to display for the link. For example, `imagelink:"IMG"`.
- __Colors__ - By default the player will attempt to match the board theme, but you can set your own colors. Selecting "Match Theme" will revert to matching the board theme after making any modifications.
