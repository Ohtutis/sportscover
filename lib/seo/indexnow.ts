// IndexNow (SEO master plan §8 "ping after deploy, and only what is live"): Bing, Yandex, Naver, Seznam
// and Yep accept a list of changed URLs with a key that the site serves as /<key>.txt. Google does not
// take IndexNow. The key is not a secret — it only proves the ping came from someone who can publish on
// this host — so it lives here and the key file is committed under public/. scripts/seo/indexnow.ts
// builds the ping list from the LIVE sitemap after a deploy, never from the content folder.
export const INDEXNOW_KEY = "5cc6215e20bdec1fba6516f2cfba07b0";
export const INDEXNOW_KEY_PATH = `/${INDEXNOW_KEY}.txt`;
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
