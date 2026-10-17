# Kuçi Coiffeur — njoftimet e rezervimeve

Ky paketim ruan pamjen ekzistuese dhe lidh formularin me një Netlify Function. Funksioni dërgon email përmes Resend dhe WhatsApp përmes Twilio. Çelësat privatë nuk vendosen në HTML.

## Skedarët
- `index.html` — faqja e përditësuar
- `netlify/functions/booking.js` — funksioni server-side i njoftimeve
- `netlify.toml` — konfigurimi i Netlify

## Variablat që duhen shtuar në Netlify
Project configuration → Environment variables. Shtoji si variabla private dhe bëj redeploy pasi t'i ruash.

Email (Resend):
- `RESEND_API_KEY` = API key nga Resend
- `RESEND_FROM` = dërgues i verifikuar, p.sh. `Kuçi Coiffeur <rezervime@domeni-yt.com>`
- `BOOKING_EMAIL_TO` = `selimkuci5@gmail.com`

WhatsApp (Twilio):
- `TWILIO_ACCOUNT_SID` = Account SID nga Twilio
- `TWILIO_AUTH_TOKEN` = Auth Token nga Twilio
- `TWILIO_WHATSAPP_FROM` = numri/sender-i WhatsApp i dhënë nga Twilio, zakonisht `whatsapp:+14155238886` për Sandbox
- `TWILIO_WHATSAPP_TO` = numri që merr njoftimet në format ndërkombëtar, p.sh. `whatsapp:+38349880789` vetëm nëse ky është numri yt i saktë WhatsApp

## Shënime të rëndësishme
- Dërgimi real nuk funksionon derisa të vendosen kredencialet e sakta.
- Resend kërkon një dërgues të verifikuar; kufizimet e sandbox-it mund të lejojnë vetëm adresa të verifikuara.
- Për Twilio Sandbox, ndiq udhëzimet e Twilio për ta lidhur numrin marrës me Sandbox (mesazh opt-in). Për përdorim real, konfiguro një WhatsApp sender të miratuar. Mesazhet e nisura nga biznesi mund të kërkojnë template të miratuar, varësisht nga dritarja e bisedës dhe rregullat e WhatsApp.
- Faqja dërgon kërkesën, por nuk bllokon oraret, nuk ruan rezervime në bazë të dhënash dhe nuk konfirmon automatikisht se koha është e lirë.
- Ky projekt nuk përpunon pagesa online. Opsioni i pagesës online është vetëm përshkrues.
- Para publikimit, bëj test me një rezervim provë dhe verifiko të dy kanalet.

## Publikimi (funksionet kërkojnë deploy që mbështet Netlify Functions)
**Mos e përdor vetëm drag-and-drop të skedarit HTML**: formulari ka nevojë edhe për `netlify/functions/booking.js`.

Mënyra më e përshtatshme:
1. Shpaketo ZIP-in në kompjuter.
2. Hape repository-n tënd në GitHub dhe ngarko `index.html`, `netlify.toml` dhe dosjen `netlify/functions/booking.js` (ruaj strukturën e dosjeve).
3. Në Netlify, hap Project configuration → Build & deploy → Continuous deployment dhe lidhe me atë repository, nëse nuk është lidhur tashmë. Kontrollo që branch-i i publikimit është branch-i ku ngarkove skedarët.
4. Në Netlify, hap Project configuration → Environment variables dhe shto variablat e mësipërme.
5. Shkakto një deploy të ri dhe prit të përfundojë me sukses.
6. Testo formularin në faqen live dhe kontrollo emailin, WhatsApp-in dhe Function logs në Netlify.

Alternativë për përdorues me përvojë: përdor Netlify CLI (`netlify deploy --prod`) nga dosja e projektit, pasi të kesh lidhur site-in e duhur.
