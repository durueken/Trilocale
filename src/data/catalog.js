// Eşya kataloğu.
// Model mesh'leri eşya bazında değil malzeme bazında bölündüğü için her eşya kendi
// mesh adlarıyla (Object_N, N = glTF mesh index + 2) elle eşlenir.
//   meshes: vurgulanacak ve tıklanabilir mesh'ler
//   box:    mesh'ler eşyanın tamamını kapsamıyorsa model cm cinsinden [x0, y0, z0, x1, y1, z1]
//   view:   kameranın eşyaya hangi yönden bakacağı (model düzleminde eşyadan kameraya; 3. değer yükseklik)
export const catalog = [
  /* ---------- Salon ---------- */
  {
    id: 'kanepe',
    room: 'salon',
    name: 'Üç Kişilik Kanepe',
    category: 'Oturma',
    materials: ['Orman yeşili kadife', 'Kapitone sırt', 'Gizli ayak'],
    description:
      'Salonun doğu duvarına yaslanan, derin oturumlu kanepe. Koyu yeşil döşemesi açık meşe zeminle kontrast kurarak mekânın renk ağırlığını taşıyor.',
    meshes: ['Object_13'],
    view: [-1, -0.25, 0.45],
  },
  {
    id: 'medya-unitesi',
    room: 'salon',
    name: 'Medya Duvarı',
    category: 'Depolama',
    materials: ['Füme meşe kaplama', 'Brüt beton panel', 'Kalay kaide'],
    description:
      'Mutfakla salon arasında bölücü görevi gören alçak konsol ve yüksek dolap. Televizyonu çerçeveleyen bu kurgu, açık planı görsel olarak ikiye ayırıyor.',
    meshes: ['Object_56', 'Object_21', 'Object_55', 'Object_57', 'Object_42'],
    view: [1, 0.1, 0.4],
  },
  {
    id: 'televizyon',
    room: 'salon',
    name: 'Televizyon',
    category: 'Elektronik',
    materials: ['Nikel çerçeve'],
    description: 'Medya duvarına gömülü ekran; kanepeyle tam karşılıklı, göz hizasının hafif altında konumlanıyor.',
    meshes: ['Object_54'],
    view: [1, 0, 0.15],
  },
  {
    id: 'raf-unitesi',
    room: 'salon',
    name: 'Açık Raf Ünitesi',
    category: 'Depolama',
    materials: ['Siyah lake meşe', 'Pirinç detay'],
    description:
      'Giriş kapısının yanında yükselen merdiven formlu açık raf. Siyah lake gövdesi medya duvarının koyu tonuyla diyalog kuruyor; kitaplar ve objeler için hafif bir vitrin.',
    meshes: ['Object_18', 'Object_16'],
    view: [-1, 0.3, 0.35],
  },

  /* ---------- Yemek alanı ---------- */
  {
    id: 'yemek-masasi',
    room: 'yemek',
    name: 'Beton Tablalı Yemek Masası',
    category: 'Masa',
    materials: ['Cilalı beton tabla', 'Meşe ayak'],
    description: 'Dört kişilik yuvarlak masa. Beton tablanın serinliği, altındaki yuvarlak yeşil halıyla yumuşatılıyor.',
    meshes: ['Object_12'],
    box: [-8329, -121, 0, -8209, -1, 76],
    view: [1, 0.6, 0.7],
  },
  {
    id: 'sandalyeler',
    room: 'yemek',
    name: 'Tel Sandalyeler',
    category: 'Oturma',
    materials: ['Siyah çelik tel', 'Zeytin yeşili deri minder'],
    description: 'Masayı çevreleyen hafif tel sandalyeler. Deri minderleri, kanepenin yeşil tonunu yemek alanına taşıyor.',
    meshes: ['Object_63', 'Object_48'],
    view: [1, 0.4, 0.55],
  },
  {
    id: 'hali',
    room: 'yemek',
    name: 'Yuvarlak Halı',
    category: 'Tekstil',
    materials: ['Orman yeşili dimi', 'Desenli yün'],
    description: 'Yemek alanını açık planın içinde tanımlayan yuvarlak halı; masanın formunu zemine yansıtıyor.',
    meshes: ['Object_4', 'Object_22'],
    view: [1, 0.3, 1.1],
  },

  /* ---------- Mutfak ---------- */
  {
    id: 'ocak-firin',
    room: 'mutfak',
    name: 'Ankastre Fırın & Ocak',
    category: 'Beyaz Eşya',
    materials: ['Paslanmaz çelik', 'Siyah cam seramik'],
    description: 'Tezgâh altına yerleştirilmiş fırın ve üstündeki dört gözlü cam seramik ocak; dijital saat ekranlı.',
    meshes: ['Object_2', 'Object_3', 'Object_7', 'Object_8', 'Object_19', 'Object_20', 'Object_23'],
    view: [-1, 0, 0.45],
  },
  {
    id: 'evye',
    room: 'mutfak',
    name: 'Evye & Ankastre Mikrodalga',
    category: 'Armatür',
    materials: ['Antrasit granit kompozit', 'Fırçalanmış alüminyum', 'Siyah çerçeve'],
    description:
      'Tezgâha gömme antrasit evye ve kuğu boyunlu batarya; hemen yanındaki boy dolabında göz hizasına yerleştirilmiş ankastre mikrodalga.',
    meshes: ['Object_37', 'Object_15'],
    view: [-1, -0.2, 0.6],
  },
  {
    id: 'mutfak-dolaplari',
    room: 'mutfak',
    name: 'Mutfak Dolapları',
    category: 'Depolama',
    materials: ['Mat beyaz lake', 'Açık meşe tezgâh'],
    description: 'Koridor tipi mutfağın alt dolapları. Beyaz yüzeyler dar alanı ferah gösterirken meşe tezgâh sıcaklık katıyor.',
    meshes: ['Object_75'],
    view: [-0.7, -1, 0.5],
  },

  /* ---------- Hol ---------- */
  {
    id: 'camasir-makinesi',
    room: 'hol',
    name: 'Çamaşır Makinesi',
    category: 'Beyaz Eşya',
    materials: ['Beyaz emaye', 'Füme cam kapak'],
    description: 'Hol nişine yerleştirilmiş önden yüklemeli makine; banyolara ve yatak odalarına eşit mesafede.',
    meshes: ['Object_29', 'Object_14'],
    view: [-1, -0.2, 0.35],
  },

  /* ---------- Banyo ---------- */
  {
    id: 'lavabo',
    room: 'banyo',
    name: 'Lavabo & Ayna',
    category: 'Vitrifiye',
    materials: ['Beyaz porselen', 'Krom batarya', 'Duvar boyu ayna'],
    description: 'Tezgâh üstü lavabo, krom batarya ve duvar boyunca uzanan ayna küçük banyoyu derinleştiriyor.',
    meshes: ['Object_70', 'Object_51'],
    view: [1, 0, 0.35],
  },
  {
    id: 'klozet-bide',
    room: 'banyo',
    name: 'Asma Bide',
    category: 'Vitrifiye',
    materials: ['Beyaz porselen', 'Krom armatür'],
    description:
      'Klozetle aynı hatta duvara asılı bide. Asma seramikler zemini açık bırakarak temizliği kolaylaştırıyor ve küçük banyoyu daha geniş gösteriyor.',
    meshes: ['Object_30', 'Object_65'],
    view: [-1, 0, 0.5],
  },
  {
    id: 'dus',
    room: 'banyo',
    name: 'Cam Duş Kabini',
    category: 'Duş',
    materials: ['Temperli füme cam', 'Gri mozaik'],
    description: 'Banyonun güney ucunda yer alan, çerçevesiz cam panelli duş alanı.',
    meshes: [],
    box: [-8573, -160, 0, -8478, -80, 221],
    view: [1, 1, 0.3],
  },

  /* ---------- İkinci banyo ---------- */
  {
    id: 'lavabo2',
    room: 'banyo2',
    name: 'Lavabo & Ayna',
    category: 'Vitrifiye',
    materials: ['Beyaz porselen', 'Krom batarya'],
    description: 'Birinci banyonun aynası: aynı lavabo ve ayna kurgusu, mavi-beyaz damalı zeminle farklı bir karaktere bürünüyor.',
    meshes: ['Object_71', 'Object_52'],
    view: [1, 0, 0.35],
  },
  {
    id: 'klozet-bide2',
    room: 'banyo2',
    name: 'Asma Bide',
    category: 'Vitrifiye',
    materials: ['Beyaz porselen', 'Krom armatür'],
    description: 'Mavi-beyaz damalı zeminin üzerinde, klozetin yanında duvara asılı bide.',
    meshes: ['Object_31', 'Object_66'],
    view: [0.35, -1, 0.75],
  },
  {
    id: 'dus2',
    room: 'banyo2',
    name: 'Cam Duş Kabini',
    category: 'Duş',
    materials: ['Temperli füme cam', 'Mavi-beyaz damalı zemin'],
    description: 'Kapının hemen yanındaki duş alanı; cam paneller küçük banyonun derinliğini kesmeden ıslak hacmi ayırıyor.',
    meshes: [],
    box: [-8472, 273, 0, -8383, 361, 221],
    view: [-1, 0.6, 0.3],
  },

  /* ---------- Yatak odası I ---------- */
  {
    id: 'yatak1',
    room: 'yatak1',
    name: 'Tek Kişilik Yatak',
    category: 'Yatak',
    materials: ['Açık meşe karyola', 'Mavi pamuk nevresim', 'Kapitone yastık'],
    description: 'Pencereye dik yerleşen yatak; başucundaki kapitone yastık odaya otel konforu katıyor.',
    meshes: ['Object_41', 'Object_39'],
    box: [-8715, -172, 0, -8603, 37, 95],
    view: [0.25, 1, 0.9],
  },
  {
    id: 'sandalye1',
    room: 'yatak1',
    name: 'Çalışma Köşesi',
    category: 'Oturma',
    materials: ['Kömür grisi kumaş', 'Beyaz lake'],
    description: 'Pencere önündeki çalışma köşesi ve yanındaki kömür grisi sandalye.',
    meshes: ['Object_28'],
    view: [1, 0.5, 0.5],
  },

  /* ---------- Yatak odası II ---------- */
  {
    id: 'yatak2',
    room: 'yatak2',
    name: 'Tek Kişilik Yatak',
    category: 'Yatak',
    materials: ['Açık meşe karyola', 'Mavi pamuk nevresim'],
    description: 'Batı duvarına yaslanan yatak; pencereden gelen yan ışıkla güne yumuşak bir başlangıç.',
    meshes: ['Object_40'],
    box: [-8917, 300, 0, -8800, 522, 95],
    view: [1, -0.6, 0.6],
  },
  {
    id: 'calisma2',
    room: 'yatak2',
    name: 'Çalışma Masası',
    category: 'Masa',
    materials: ['Antrasit lake', 'Kömür grisi kumaş sandalye'],
    description: 'Duvara yaslanan kompakt çalışma masası ve sandalyesi.',
    meshes: ['Object_27'],
    box: [-8931, 150, 0, -8830, 280, 80],
    view: [1, 0, 0.5],
  },
  {
    id: 'gardirop',
    room: 'yatak2',
    name: 'Gömme Gardırop',
    category: 'Depolama',
    materials: ['Beyaz meşe kaplama'],
    description: 'Tavana kadar yükselen gömme gardırop, odanın doğu duvarını bütünüyle depolamaya ayırıyor.',
    meshes: ['Object_62'],
    box: [-8640, 272, 0, -8583, 471, 211],
    view: [-1, 0, 0.3],
  },
]

export const itemById = Object.fromEntries(catalog.map((i) => [i.id, i]))
export const meshToItem = Object.fromEntries(catalog.flatMap((i) => i.meshes.map((m) => [m, i.id])))
