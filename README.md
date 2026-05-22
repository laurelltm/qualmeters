# QualMeters Static Website

Static restart of the QualMeters website using the Google Stitch design direction and sitemap content.

## Commands

Use the newer local Node runtime on this machine:

```sh
/Users/tomi/.nvm/versions/node/v24.15.0/bin/node tools/generate-static-site.mjs
/Users/tomi/.nvm/versions/node/v24.15.0/bin/node --test test/*.test.mjs
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/`.

## GitHub Pages

The generated HTML uses relative links so the site works from the project Pages URL:

`https://laurelltm.github.io/qualmeters/`
