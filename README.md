# Trilocale · Via Boncompagni, Milano

Milano'daki üç odalı bir dairenin 3D modeli içinde serbestçe gezinilen bir iç mimarlık / mobilya vitrini.
React, React Three Fiber ve three.js ile yapıldı.

## Gezinti

- **Genel bakış:** sürükle = döndür, kaydır = imlece yakınlaş; en yakına gelip kaydırmaya devam edince ya da zemine çift tıklayınca odaya girilir.
- **Oda içi:** kaydır = imlecin yönünde ilerle/geri (duvarda durur), sürükle = etrafa bak, zemine çift tık = oraya git, W/A/S/D ya da oklar.
- **Eşya:** pine ya da eşyaya tıkla = yakından incele ve bilgi kartı; `Esc` = geri.

## Geliştirme

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # dist/
npm run model:optimize # 3D/…glb -> public/models/apartment.glb (WebP + meshopt)
```

Adrese `?debug` eklenirse tıklanan noktanın model koordinatları (cm) gösterilir; yeni eşya ve oda pozlarını
`src/data/catalog.js` ve `src/data/rooms.js` içine eklerken kullanılır.

## Atıf

Bu çalışma, Fabio Siccardi'nin ["Trilocale Via Boncompagni Milano"](https://sketchfab.com/3d-models/trilocale-via-boncompagni-milano-dd261cf6c2e647cab915f015230bb15e)
modeline ([Sketchfab](https://sketchfab.com/FabioSiccardi)) dayanır ve
[CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/) lisansıyla kullanılmaktadır.
