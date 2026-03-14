import { useRef, useState } from 'react';

export type Step5State = {
  fullName: string;
  city: string;
  phone: string;
};

export type Step5Errors = Partial<Record<keyof Step5State, string>>;

type Props = {
  value: Step5State;
  errors: Step5Errors;
  onChange: (field: keyof Step5State, value: string) => void;
  onPrev: () => void;
  onValidate: () => boolean;
  offerPayload: any;
};

const formatPhoneNumber = (digits: string) => {
  // digits should start with 90 and include up to 10 more digits
  let clean = digits.replace(/\D/g, '');
  if (!clean.startsWith('90')) {
    if (clean.startsWith('0')) {
      clean = '90' + clean.slice(1);
    } else {
      clean = '90' + clean;
    }
  }
  clean = clean.slice(0, 12);
  if (clean.length < 2) clean = '90';

  const area = clean.slice(2, 5);
  const p1 = clean.slice(5, 8);
  const p2 = clean.slice(8, 10);
  const p3 = clean.slice(10, 12);

  let out = '+90 ';
  out += area ? `(${area}${area.length < 3 ? ')'.padStart(4 - area.length, ')') : ')'}` : '(...)';
  out += area.length === 3 ? ' ' : ' ';
  out += p1 ? p1 : '___';
  out += ' ';
  out += p2 ? p2 : '__';
  out += ' ';
  out += p3 ? p3 : '__';
  return out;
};

export default function Step5({ value, errors, onChange, onPrev, onValidate, offerPayload }: Props) {
  const [isSending, setIsSending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  const handleSubmit = async () => {
    if (submitLockRef.current || isSubmitted) return;
    if (!onValidate()) return;
    submitLockRef.current = true;
    setIsSending(true);
    setStatus(null);
    try {
      const formType =
        (offerPayload as any)?.formType ??
        (offerPayload?.step1 ? 'arac-sat' : 'unknown');
      await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType,
          phone: value.phone,
          payload: offerPayload ?? value
        })
      });
    } catch {
      // ignore in MVP
    }
    try {
      const offerRes = await fetch('/api/send-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerPayload)
      });
      const offerData = await offerRes.json().catch(() => ({}));
      if (!offerRes.ok || !offerData?.success) {
        setStatus(offerData?.error || 'Teklif iletilemedi. Lütfen tekrar deneyin.');
        setIsSending(false);
        submitLockRef.current = false;
        return;
      }

      setIsSubmitted(true);
      setStatus('Başarılı! Teklif iletildi. En kısa sürede sizinle iletişime geçeceğiz.');
    } catch {
      setStatus('Teklif iletilemedi. Lütfen tekrar deneyin.');
      submitLockRef.current = false;
    } finally {
      setIsSending(false);
    }
  };
  const cityOptions = [
    '34 İstanbul',
    '06 Ankara',
    '35 İzmir',
    '01 Adana',
    '02 Adıyaman',
    '03 Afyonkarahisar',
    '04 Ağrı',
    '68 Aksaray',
    '05 Amasya',
    '07 Antalya',
    '75 Ardahan',
    '08 Artvin',
    '09 Aydın',
    '10 Balıkesir',
    '74 Bartın',
    '72 Batman',
    '69 Bayburt',
    '11 Bilecik',
    '12 Bingöl',
    '13 Bitlis',
    '14 Bolu',
    '15 Burdur',
    '16 Bursa',
    '17 Çanakkale',
    '18 Çankırı',
    '19 Çorum',
    '20 Denizli',
    '21 Diyarbakır',
    '81 Düzce',
    '22 Edirne',
    '23 Elazığ',
    '24 Erzincan',
    '25 Erzurum',
    '26 Eskişehir',
    '27 Gaziantep',
    '28 Giresun',
    '29 Gümüşhane',
    '30 Hakkari',
    '31 Hatay',
    '76 Iğdır',
    '32 Isparta',
    '46 Kahramanmaraş',
    '78 Karabük',
    '70 Karaman',
    '36 Kars',
    '37 Kastamonu',
    '38 Kayseri',
    '79 Kilis',
    '71 Kırıkkale',
    '39 Kırklareli',
    '40 Kırşehir',
    '41 Kocaeli',
    '42 Konya',
    '43 Kütahya',
    '44 Malatya',
    '45 Manisa',
    '47 Mardin',
    '33 Mersin',
    '48 Muğla',
    '49 Muş',
    '50 Nevşehir',
    '51 Niğde',
    '52 Ordu',
    '80 Osmaniye',
    '53 Rize',
    '54 Sakarya',
    '55 Samsun',
    '56 Siirt',
    '57 Sinop',
    '58 Sivas',
    '63 Şanlıurfa',
    '73 Şırnak',
    '59 Tekirdağ',
    '60 Tokat',
    '61 Trabzon',
    '62 Tunceli',
    '64 Uşak',
    '65 Van',
    '77 Yalova',
    '66 Yozgat',
    '67 Zonguldak'
  ];

  const districtMap: Record<string, string[]> = {
    Adana: [
      'Seyhan',
      'Yüreğir',
      'Çukurova',
      'Sarıçam',
      'Ceyhan',
      'Pozantı',
      'Karaisalı',
      'Aladağ',
      'İmamoğlu',
      'Karataş',
      'Kozan',
      'Feke',
      'Tufanbeyli',
      'Saimbeyli',
      'Yumurtalık'
    ],
    Adıyaman: ['Merkez', 'Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kahta', 'Samsat', 'Sincik', 'Tut'],
    Afyonkarahisar: [
      'Merkez',
      'Dinar',
      'Sandıklı',
      'Bolvadin',
      'Emirdağ',
      'Çay',
      'İscehisar',
      'Şuhut',
      'Sultandağı',
      'Çobanlar',
      'Başmakçı',
      'Bayat',
      'Hocalar',
      'İhsaniye',
      'Kızılören',
      'Sinanpaşa',
      'Sultandağı'
    ],
    Ağrı: ['Merkez', 'Doğubayazıt', 'Patnos', 'Diyadin', 'Eleşkirt', 'Tutak', 'Hamur', 'Taşlıçay'],
    Aksaray: ['Merkez', 'Ortaköy', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Sarıyahşi', 'Ağaçören'],
    Amasya: ['Merkez', 'Merzifon', 'Suluova', 'Taşova', 'Göynücek', 'Gümüşhacıköy', 'Hamamözü'],
    Ankara: [
      'Çankaya',
      'Keçiören',
      'Yenimahalle',
      'Mamak',
      'Sincan',
      'Etimesgut',
      'Altındağ',
      'Pursaklar',
      'Polatlı',
      'Çubuk',
      'Kahramankazan',
      'Beypazarı',
      'Elmadağ',
      'Gölbaşı',
      'Şereflikoçhisar',
      'Akyurt',
      'Haymana',
      'Kalecik',
      'Kızılcahamam',
      'Ayaş',
      'Bala',
      'Çamlıdere',
      'Evren',
      'Güdül',
      'Nallıhan'
    ],
    Antalya: [
      'Muratpaşa',
      'Kepez',
      'Konyaaltı',
      'Alanya',
      'Manavgat',
      'Serik',
      'Kumluca',
      'Finike',
      'Kemer',
      'Gazipaşa',
      'Kaş',
      'Korkuteli',
      'Elmalı',
      'Demre',
      'Akseki',
      'İbradı',
      'Gündoğmuş'
    ],
    Ardahan: ['Merkez', 'Göle', 'Hanak', 'Posof', 'Çıldır', 'Damal'],
    Artvin: ['Merkez', 'Hopa', 'Arhavi', 'Yusufeli', 'Borçka', 'Şavşat', 'Murgul', 'Ardanuç'],
    Aydın: [
      'Efeler',
      'Nazilli',
      'Söke',
      'Kuşadası',
      'Didim',
      'Çine',
      'Bozdoğan',
      'Germencik',
      'İncirliova',
      'Koçarlı',
      'Karpuzlu',
      'Karacasu',
      'Kuyucak',
      'Buharkent',
      'Yenipazar',
      'Sultanhisar',
      'Köşk'
    ],
    Balıkesir: [
      'Karesi',
      'Altıeylül',
      'Bandırma',
      'Edremit',
      'Ayvalık',
      'Burhaniye',
      'Gönen',
      'Bigadiç',
      'İvrindi',
      'Sındırgı',
      'Manyas',
      'Erdek',
      'Susurluk',
      'Dursunbey',
      'Havran',
      'Kepsut',
      'Marmara'
    ],
    Bartın: ['Merkez', 'Amasra', 'Ulus', 'Kurucaşile'],
    Batman: ['Merkez', 'Kozluk', 'Sason', 'Hasankeyf', 'Gercüş', 'Beşiri'],
    Bayburt: ['Merkez', 'Aydıntepe', 'Demirözü'],
    Bilecik: ['Merkez', 'Bozüyük', 'Söğüt', 'Osmaneli', 'Gölpazarı', 'Pazaryeri', 'İnhisar', 'Yenipazar'],
    Bingöl: ['Merkez', 'Genç', 'Solhan', 'Karlıova', 'Adaklı', 'Kiğı', 'Yayladere', 'Yedisu'],
    Bitlis: ['Merkez', 'Tatvan', 'Güroymak', 'Ahlat', 'Hizan', 'Mutki', 'Adilcevaz'],
    Bolu: ['Merkez', 'Gerede', 'Göynük', 'Kıbrıscık', 'Mengen', 'Mudurnu', 'Seben', 'Dörtdivan', 'Yeniçağa'],
    Burdur: ['Merkez', 'Bucak', 'Gölhisar', 'Yeşilova', 'Tefenni', 'Ağlasun', 'Çavdır', 'Karamanlı', 'Kemer', 'Altınyayla'],
    Bursa: [
      'Osmangazi',
      'Yıldırım',
      'Nilüfer',
      'İnegöl',
      'Gemlik',
      'Mustafakemalpaşa',
      'Karacabey',
      'Mudanya',
      'Kestel',
      'Gürsu',
      'Orhangazi',
      'Yenişehir',
      'İznik',
      'Orhaneli',
      'Keles',
      'Harmancık',
      'Büyükorhan'
    ],
    Çanakkale: [
      'Merkez',
      'Biga',
      'Çan',
      'Gelibolu',
      'Lapseki',
      'Ezine',
      'Ayvacık',
      'Bayramiç',
      'Eceabat',
      'Gökçeada',
      'Yenice',
      'Bozcaada'
    ],
    Çankırı: ['Merkez', 'Çerkeş', 'Eldivan', 'Ilgaz', 'Korgun', 'Kurşunlu', 'Orta', 'Şabanözü', 'Yapraklı', 'Atkaracalar', 'Kızılırmak', 'Bayramören'],
    Çorum: ['Merkez', 'Sungurlu', 'Osmancık', 'İskilip', 'Alaca', 'Kargı', 'Boğazkale', 'Dodurga', 'Laçin', 'Mecitözü', 'Oğuzlar', 'Ortaköy', 'Uğurludağ'],
    Denizli: [
      'Pamukkale',
      'Merkezefendi',
      'Çivril',
      'Acıpayam',
      'Tavas',
      'Çal',
      'Sarayköy',
      'Honaz',
      'Kale',
      'Buldan',
      'Çardak',
      'Bozkurt',
      'Babadağ',
      'Bekilli',
      'Baklan',
      'Beyağaç',
      'Güney'
    ],
    Diyarbakır: [
      'Bağlar',
      'Kayapınar',
      'Yenişehir',
      'Sur',
      'Bismil',
      'Çermik',
      'Çınar',
      'Dicle',
      'Ergani',
      'Hani',
      'Hazro',
      'Kocaköy',
      'Kulp',
      'Lice',
      'Silvan',
      'Eğil'
    ],
    Düzce: ['Merkez', 'Akçakoca', 'Cumayeri', 'Gölyaka', 'Gümüşova', 'Kaynaşlı', 'Yığılca', 'Çilimli'],
    Edirne: ['Merkez', 'Keşan', 'Uzunköprü', 'İpsala', 'Havsa', 'Lalapaşa', 'Meriç', 'Enez', 'Süloğlu'],
    Elazığ: ['Merkez', 'Keban', 'Maden', 'Sivrice', 'Palu', 'Karakoçan', 'Baskil', 'Ağın', 'Arıcak', 'Alacakaya', 'Kovancılar'],
    Erzincan: ['Merkez', 'Üzümlü', 'Refahiye', 'Tercan', 'Çayırlı', 'Kemah', 'Kemaliye', 'Ilıç', 'Otlukbeli'],
    Erzurum: [
      'Yakutiye',
      'Aziziye',
      'Palandöken',
      'Oltu',
      'Horasan',
      'Pasinler',
      'Karaçoban',
      'Köprüköy',
      'Aşkale',
      'Hınıs',
      'İspir',
      'Narman',
      'Olur',
      'Pazaryolu',
      'Şenkaya',
      'Tekman',
      'Tortum',
      'Uzundere'
    ],
    Eskişehir: ['Odunpazarı', 'Tepebaşı', 'Sivrihisar', 'Çifteler', 'Seyitgazi', 'Mihalıççık', 'Alpu', 'Beylikova', 'İnönü', 'Günyüzü', 'Han', 'Mahmudiye', 'Mihalgazi'],
    Gaziantep: ['Şahinbey', 'Şehitkamil', 'Nizip', 'İslahiye', 'Oğuzeli', 'Araban', 'Nurdağı', 'Yavuzeli', 'Karkamış'],
    Giresun: [
      'Merkez',
      'Bulancak',
      'Espiye',
      'Eynesil',
      'Görele',
      'Keşap',
      'Piraziz',
      'Şebinkarahisar',
      'Tirebolu',
      'Yağlıdere',
      'Alucra',
      'Çamoluk',
      'Çanakçı',
      'Dereli',
      'Doğankent',
      'Güce'
    ],
    Gümüşhane: ['Merkez', 'Kelkit', 'Şiran', 'Torul', 'Kürtün', 'Köse'],
    Hakkari: ['Merkez', 'Yüksekova', 'Şemdinli', 'Çukurca', 'Derecik'],
    Hatay: [
      'Antakya',
      'İskenderun',
      'Defne',
      'Samandağ',
      'Dörtyol',
      'Kırıkhan',
      'Reyhanlı',
      'Altınözü',
      'Arsuz',
      'Belen',
      'Erzin',
      'Hassa',
      'Kumlu',
      'Payas'
    ],
    Iğdır: ['Merkez', 'Aralık', 'Karakoyunlu', 'Tuzluca'],
    Isparta: [
      'Merkez',
      'Yalvaç',
      'Eğirdir',
      'Şarkikaraağaç',
      'Gelendost',
      'Keçiborlu',
      'Senirkent',
      'Uluborlu',
      'Aksu',
      'Atabey',
      'Gönen',
      'Sütçüler',
      'Yenişarbademli'
    ],
    İstanbul: [
      'Adalar',
      'Ataşehir',
      'Avcılar',
      'Bağcılar',
      'Bahçelievler',
      'Bakırköy',
      'Başakşehir',
      'Bayrampaşa',
      'Beşiktaş',
      'Beykoz',
      'Beylikdüzü',
      'Beyoğlu',
      'Büyükçekmece',
      'Çatalca',
      'Çekmeköy',
      'Esenler',
      'Esenyurt',
      'Eyüpsultan',
      'Fatih',
      'Gaziosmanpaşa',
      'Güngören',
      'Kadıköy',
      'Kağıthane',
      'Kartal',
      'Küçükçekmece',
      'Maltepe',
      'Pendik',
      'Sancaktepe',
      'Sarıyer',
      'Silivri',
      'Sultanbeyli',
      'Sultangazi',
      'Şile',
      'Şişli',
      'Tuzla',
      'Ümraniye',
      'Üsküdar',
      'Zeytinburnu'
    ],
    İzmir: [
      'Konak',
      'Bornova',
      'Karşıyaka',
      'Buca',
      'Çiğli',
      'Gaziemir',
      'Balçova',
      'Bayraklı',
      'Karabağlar',
      'Narlıdere',
      'Güzelbahçe',
      'Foça',
      'Menemen',
      'Aliağa',
      'Bergama',
      'Dikili',
      'Kınık',
      'Kiraz',
      'Ödemiş',
      'Beydağ',
      'Bayındır',
      'Torbalı',
      'Selçuk',
      'Seferihisar',
      'Tire',
      'Urla',
      'Çeşme',
      'Menderes'
    ],
    Kahramanmaraş: [
      'Dulkadiroğlu',
      'Onikişubat',
      'Elbistan',
      'Afşin',
      'Göksun',
      'Pazarcık',
      'Türkoğlu',
      'Andırın',
      'Çağlayancerit',
      'Ekinözü',
      'Nurhak'
    ],
    Karabük: ['Merkez', 'Safranbolu', 'Eskipazar', 'Ovacık', 'Yenice', 'Eflani'],
    Karaman: ['Merkez', 'Ermenek', 'Kâzımkarabekir', 'Ayrancı', 'Başyayla', 'Sarıveliler'],
    Kars: ['Merkez', 'Kağızman', 'Sarıkamış', 'Selim', 'Susuz', 'Digor', 'Akyaka', 'Arpaçay'],
    Kastamonu: [
      'Merkez',
      'Tosya',
      'İnebolu',
      'Taşköprü',
      'Cide',
      'Araç',
      'Devrekani',
      'Bozkurt',
      'Daday',
      'Küre',
      'Çatalzeytin',
      'Azdavay',
      'Pınarbaşı',
      'Abana',
      'Doğanyurt',
      'İhsangazi',
      'Şenpazar',
      'Hanönü',
      'Seydiler'
    ],
    Kayseri: [
      'Kocasinan',
      'Melikgazi',
      'Talas',
      'Develi',
      'Yahyalı',
      'Tomarza',
      'Bünyan',
      'Pınarbaşı',
      'İncesu',
      'Sarıoğlan',
      'Özvatan',
      'Felahiye',
      'Hacılar',
      'Akkışla'
    ],
    Kilis: ['Merkez', 'Elbeyli', 'Musabeyli', 'Polateli'],
    Kırıkkale: ['Merkez', 'Keskin', 'Delice', 'Çelebi', 'Karakeçili', 'Balışeyh', 'Sulakyurt', 'Yahşihan'],
    Kırklareli: ['Merkez', 'Lüleburgaz', 'Babaeski', 'Vize', 'Pınarhisar', 'Kofçaz', 'Pehlivanköy', 'Demirköy'],
    Kırşehir: ['Merkez', 'Kaman', 'Mucur', 'Çiçekdağı', 'Boztepe', 'Akpınar', 'Akçakent'],
    Kocaeli: [
      'İzmit',
      'Gebze',
      'Gölcük',
      'Darıca',
      'Körfez',
      'Çayırova',
      'Başiskele',
      'Kartepe',
      'Kandıra',
      'Derince',
      'Dilovası'
    ],
    Konya: [
      'Selçuklu',
      'Karatay',
      'Meram',
      'Ereğli',
      'Beyşehir',
      'Akşehir',
      'Seydişehir',
      'Çumra',
      'Ilgın',
      'Cihanbeyli',
      'Kulu',
      'Doğanhisar',
      'Hadim',
      'Taşkent',
      'Karapınar',
      'Bozkır',
      'Emirgazi',
      'Güneysınır',
      'Hüyük',
      'Kadınhanı',
      'Sarayönü',
      'Yalıhüyük',
      'Ahırlı',
      'Altınekin',
      'Derebucak',
      'Derbent'
    ],
    Kütahya: [
      'Merkez',
      'Tavşanlı',
      'Simav',
      'Gediz',
      'Emet',
      'Domaniç',
      'Hisarcık',
      'Altıntaş',
      'Aslanapa',
      'Dumlupınar',
      'Pazarlar',
      'Çavdarhisar',
      'Şaphane'
    ],
    Malatya: [
      'Battalgazi',
      'Yeşilyurt',
      'Doğanşehir',
      'Darende',
      'Akçadağ',
      'Hekimhan',
      'Pütürge',
      'Arguvan',
      'Arapgir',
      'Yazıhan',
      'Kuluncak',
      'Kale'
    ],
    Manisa: [
      'Şehzadeler',
      'Yunusemre',
      'Akhisar',
      'Turgutlu',
      'Soma',
      'Alaşehir',
      'Salihli',
      'Kula',
      'Sarıgöl',
      'Gördes',
      'Demirci',
      'Kırkağaç',
      'Selendi',
      'Saruhanlı',
      'Köprübaşı'
    ],
    Mardin: [
      'Artuklu',
      'Kızıltepe',
      'Nusaybin',
      'Midyat',
      'Mazıdağı',
      'Dargeçit',
      'Derik',
      'Savur',
      'Ömerli',
      'Yeşilli'
    ],
    Mersin: [
      'Akdeniz',
      'Toroslar',
      'Yenişehir',
      'Mezitli',
      'Tarsus',
      'Erdemli',
      'Silifke',
      'Anamur',
      'Mut',
      'Bozyazı',
      'Gülnar',
      'Aydıncık',
      'Çamlıyayla'
    ],
    Muğla: [
      'Bodrum',
      'Menteşe',
      'Fethiye',
      'Marmaris',
      'Milas',
      'Seydikemer',
      'Ortaca',
      'Yatağan',
      'Datça',
      'Köyceğiz',
      'Ula',
      'Dalaman',
      'Kavaklıdere'
    ],
    Muş: ['Merkez', 'Bulanık', 'Malazgirt', 'Varto', 'Hasköy', 'Korkut'],
    Nevşehir: ['Merkez', 'Avanos', 'Derinkuyu', 'Gülşehir', 'Hacıbektaş', 'Kozaklı', 'Ürgüp', 'Acıgöl'],
    Niğde: ['Merkez', 'Bor', 'Çiftlik', 'Altunhisar', 'Ulukışla', 'Çamardı'],
    Ordu: [
      'Altınordu',
      'Ünye',
      'Fatsa',
      'Perşembe',
      'Gölköy',
      'Korgan',
      'Ayubeyli',
      'Kumru',
      'Mesudiye',
      'Ulubey',
      'Çamaş',
      'Çatalpınar',
      'Çaybaşı',
      'Gülyalı',
      'Gürgentepe',
      'İkizce',
      'Kabadüz',
      'Kabataş'
    ],
    Osmaniye: ['Merkez', 'Kadirli', 'Düziçi', 'Bahçe', 'Toprakkale', 'Hasanbeyli', 'Sumbas'],
    Rize: [
      'Merkez',
      'Çayeli',
      'Pazar',
      'Ardeşen',
      'Fındıklı',
      'İkizdere',
      'Kalkandere',
      'Derepazarı',
      'Güneysu',
      'Hemşin',
      'Çamlıhemşin',
      'İyidere'
    ],
    Sakarya: [
      'Adapazarı',
      'Serdivan',
      'Erenler',
      'Arifiye',
      'Akyazı',
      'Geyve',
      'Hendek',
      'Karasu',
      'Kaynarca',
      'Kocaali',
      'Pamukova',
      'Sapanca',
      'Söğütlü',
      'Taraklı',
      'Ferizli'
    ],
    Samsun: [
      'Atakum',
      'Canik',
      'İlkadım',
      'Tekkeköy',
      'Bafra',
      'Çarşamba',
      'Havza',
      'Kavak',
      'Ladik',
      '19 Mayıs',
      'Alaçam',
      'Asarcık',
      'Ayvacık',
      'Salıpazarı',
      'Terme',
      'Vezirköprü',
      'Yakakent'
    ],
    Siirt: ['Merkez', 'Kurtalan', 'Pervari', 'Baykan', 'Eruh', 'Şirvan', 'Tillo'],
    Sinop: ['Merkez', 'Boyabat', 'Gerze', 'Ayancık', 'Durağan', 'Erfelek', 'Saraydüzü', 'Türkeli', 'Dikmen'],
    Sivas: [
      'Merkez',
      'Zara',
      'Suşehri',
      'Şarkışla',
      'Gemerek',
      'Yıldızeli',
      'Kangal',
      'Divriği',
      'Hafik',
      'Gürün',
      'Koyulhisar',
      'Ulaş',
      'Altınyayla',
      'İmranlı',
      'Akıncılar',
      'Doğanşar',
      'Gölova'
    ],
    Şanlıurfa: [
      'Haliliye',
      'Eyyübiye',
      'Karaköprü',
      'Suruç',
      'Viranşehir',
      'Birecik',
      'Siverek',
      'Akçakale',
      'Bozova',
      'Ceylanpınar',
      'Harran',
      'Halfeti'
    ],
    Şırnak: ['Merkez', 'Cizre', 'Silopi', 'İdil', 'Uludere', 'Beytüşşebap', 'Güçlükonak'],
    Tekirdağ: [
      'Süleymanpaşa',
      'Çorlu',
      'Çerkezköy',
      'Kapaklı',
      'Malkara',
      'Muratlı',
      'Ergene',
      'Hayrabolu',
      'Şarköy',
      'Saray',
      'Marmaraereğlisi'
    ],
    Tokat: [
      'Merkez',
      'Erbaa',
      'Niksar',
      'Turhal',
      'Zile',
      'Reşadiye',
      'Pazar',
      'Almus',
      'Yeşilyurt',
      'Başçiftlik',
      'Sulusaray'
    ],
    Trabzon: [
      'Ortahisar',
      'Akçaabat',
      'Arsin',
      'Araklı',
      'Vakfıkebir',
      'Of',
      'Sürmene',
      'Yomra',
      'Çaykara',
      'Beşikdüzü',
      'Maçka',
      'Tonya',
      'Düzköy',
      'Şalpazarı',
      'Hayrat',
      'Dernekpazarı',
      'Köprübaşı'
    ],
    Tunceli: ['Merkez', 'Pertek', 'Çemişgezek', 'Hozat', 'Mazgirt', 'Nazımiye', 'Ovacık', 'Pülümür'],
    Uşak: ['Merkez', 'Banaz', 'Eşme', 'Sivaslı', 'Karahallı', 'Ulubey'],
    Van: [
      'İpekyolu',
      'Edremit',
      'Tuşba',
      'Erciş',
      'Çaldıran',
      'Çatak',
      'Bahçesaray',
      'Başkale',
      'Gürpınar',
      'Muradiye',
      'Özalp',
      'Saray'
    ],
    Yalova: ['Merkez', 'Çiftlikköy', 'Altınova', 'Armutlu', 'Termal', 'Çınarcık'],
    Yozgat: [
      'Merkez',
      'Sorgun',
      'Akdağmadeni',
      'Yerköy',
      'Boğazlıyan',
      'Sarıkaya',
      'Çayıralan',
      'Çekerek',
      'Kadışehri',
      'Aydıncık',
      'Şefaatli',
      'Yenifakılı'
    ],
    Zonguldak: ['Merkez', 'Ereğli', 'Çaycuma', 'Devrek', 'Alaplı', 'Gökçebey', 'Kilimli', 'Kozlu']
  };

  const plainCity = (city: string) => city.replace(/^\d+\s+/, '');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Konum Bilgisi</h2>
        <p className="mt-1 text-sm text-slate-600">Ad-Soyad, il ve telefon numarası giriniz.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">Ad Soyad</label>
          <input
            type="text"
            value={value.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
            placeholder="Ad Soyad"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {errors.fullName ? <p className="text-xs font-medium text-red-600">{errors.fullName}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">İl Seçin</label>
          <select
            value={value.city}
            onChange={(e) => onChange('city', e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">İl seçin</option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.city ? <p className="text-xs font-medium text-red-600">{errors.city}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">Cep Telefonu</label>
          <input
            type="tel"
            value={formatPhoneNumber(value.phone || '90')}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '');
              // normalize to start with 90
              const normalized = digits.startsWith('90')
                ? digits
                : digits.startsWith('0')
                  ? '90' + digits.slice(1)
                  : '90' + digits;
              onChange('phone', normalized.slice(0, 12));
            }}
            placeholder="+90 (___) ___ __ __"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            inputMode="numeric"
            pattern="90[0-9]{10}"
          />
          {errors.phone ? <p className="text-xs font-medium text-red-600">{errors.phone}</p> : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          ← Önceki
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
          disabled={isSending || isSubmitted}
        >
          {isSending ? 'Gönderiliyor...' : isSubmitted ? 'Gönderildi' : 'Teklif Al'}
        </button>
      </div>
      {status ? <p className="text-sm font-medium text-slate-700">{status}</p> : null}
    </div>
  );
}

