How to customize this apology website
====================================

1) Set the start date
---------------------
- Open the file: script.js
- Find the line: const START_DATE_ISO = '2025-10-15';
- Change the date to the first day you started saying sorry, in YYYY-MM-DD format.
  Example: const START_DATE_ISO = '2025-09-28';

2) Add her photos
-----------------
- Preferred: create an `images` folder inside C:\HTML and put your images there.
- Option A (manifest): create C:\HTML\images\manifest.json with an array of file names.
  Example manifest.json:
  [
    "her_smile.jpg",
    "our_trip.png",
    "us_at_park.jpg"
  ]
- Option B (fallback): open script.js and edit IMAGE_FILES to list your files.
  The files should be placed in the `images` folder.
  Example:
  const IMAGE_FILES = [
    'her_smile.jpg',
    'our_trip.png',
    'us_at_park.jpg'
  ];

3) Open the website
-------------------
- Double-click index.html to open it in your browser.
- Use the arrows to move through photos.

4) Optional text changes
------------------------
- Edit the main message text in index.html under the <section class="note"> area to personalize.

Troubleshooting
---------------
- If photos don't show: make sure the file names in IMAGE_FILES exactly match your files.
- If the day number looks wrong: confirm START_DATE_ISO is correct and in YYYY-MM-DD.

Hosting the website
-------------------
You can host this static site for free:
- GitHub Pages: push these files to a GitHub repo, enable Pages, choose the main branch.
- Netlify: drag-and-drop the folder on the Netlify dashboard.
- Vercel: import the folder as a project.

Make sure the folder structure is preserved:
C:\HTML
  index.html
  style.css
  script.js
  images\
    (your-image-files)
    manifest.json (optional)

Video support
-------------
- You can add .mp4/.webm/.ogg files into the `images` folder.
- The first video in `images/manifest.json` is used as the background.
- Videos inside the manifest will also appear as slides in the carousel.
- If a video doesn't autoplay on mobile, it may require user interaction; the site tries to mute and play inline.

Visual effects
--------------
- Floating hearts overlay (light, non-blocking, auto-adjusts to screen size).
- Typing effect on the subtitle (plays on page load).
- Captions under the carousel derived from filenames (edit names if you want nicer captions).
