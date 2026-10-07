# Sero website

Marketing site for Sero. Plain HTML/CSS/JS, no build step.

## Run locally

```sh
cd sero/website
python3 -m http.server 8000   # then open http://localhost:8000
```

## Files

- `index.html`: page structure and copy (hero, problem, modules, how it works, live dashboard, FAQ, book a demo)
- `styles.css`: brand tokens at the top; dark is the default theme, with a light/dark switch
- `data.js`: module copy and the dashboard's sample data. Edit content here.
- `app.js`: theme switch, mobile menu, module cards, the interactive dashboard and the demo form
- `thanks.html`: confirmation page used if the form is submitted without JavaScript

## Deploy (Netlify)

Create a new Netlify site from this repo with **base directory `sero/website`** (no build command).
The Book a Demo form uses Netlify Forms, so submissions show up under the site's **Forms** tab once
form detection is enabled. Locally the form shows an error message, because there is no Netlify backend.

## Still to do

- Font: add the licensed Articulat CF `woff2` files to `fonts/` and uncomment the `@font-face` rules in `styles.css`.
- Copy: the "How it works", FAQ and demo-section copy are drafts written for this build, so review them.
- Domain, analytics and a real privacy policy before launch.
