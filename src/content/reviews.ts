/**
 * Recenzie, 28 ks. Mená sú menej časté slovenské mená (na požiadanie klienta),
 * lokality + texty intaktné. Rotujúci carousel.
 */

export interface Review {
  id: string;
  name: string;
  role?: string;
  company?: string;
  location?: string;
  rating: 5;
  text: string;
  category?: "dom" | "garaz" | "hala" | "firma";
}

export const REVIEWS: Review[] = [
  // === Z Docs briefu klienta, prvé 3 ===
  {
    id: "1",
    name: "Drahomíra Habera",
    location: "Liptovské Sliače",
    rating: 5,
    text:
      "Mramorovú som chcela už dlho ale bála som sa že to bude vyzerať lacno. Vôbec nie. Hostia si vždy najprv všimnú podlahu. Spokojnosť ✨",
    category: "dom",
  },
  {
    id: "2",
    name: "Bibiana Karabová",
    location: "Banská Bystrica",
    rating: 5,
    text:
      "V kuchyni jednofarebná. Cena sedela presne ako v ponuke, žiadne dodatočné prirážky čo sme sa báli.",
    category: "dom",
  },
  {
    id: "3",
    name: "Mojmír Hrdlička",
    location: "Liptovský Mikuláš",
    rating: 5,
    text:
      "Mal som starý betón v garáži, plný olejových škvŕn po starom aute. Dali sme tam epoxid od tejto firmy, vyzerá to teraz lepšie ako u nás v obývačke 🏆 Nemyslel som si že garáž môže takto vyzerať.",
    category: "garaz",
  },

  // === 25 ďalších reálnych slovenských mien ===
  {
    id: "4",
    name: "Vlasta Štrkáčová",
    location: "Likavka",
    rating: 5,
    text:
      "V dielni už druhý rok bez problémov 💪 Chipsovú nám odporučili kvôli tomu že opticky rozbije plochu a nebude vidno toľko nečistôt.",
    category: "firma",
  },
  {
    id: "5",
    name: "Cyril Pliva",
    location: "Trenčín",
    rating: 5,
    text:
      "Metalickú máme v showroome. Klienti sa ma pýtajú kde sme to brali skoro každý deň 👌 Niekedy mám pocit že prídu skôr pozrieť podlahu ako auto.",
    category: "firma",
  },
  {
    id: "6",
    name: "Eleonóra Klobučníková",
    location: "Poprad",
    rating: 5,
    text:
      "Najskôr prišli na obhliadku, vysvetlili rozdiely medzi materiálmi. Nikto netlačil na drahšiu verziu. Odporučili to čo sedelo k mojej kuchyni a hotovo.",
    category: "dom",
  },
  {
    id: "7",
    name: "Vendelín Strakoš",
    location: "Stupava",
    rating: 5,
    text:
      "Zvládli to za víkend, v pondelok sme normálne otvárali prevádzku. To bolo pre mňa najdôležitejšie 👍",
    category: "firma",
  },
  {
    id: "8",
    name: "Lýdia Cibuľová",
    location: "Nitra",
    rating: 5,
    text:
      "Chipsová v garáži aj v dielni. Funguje. Po roku nevidím rozdiel oproti tomu ako to vyzeralo prvý deň.",
    category: "garaz",
  },
  {
    id: "9",
    name: "Slavomír Žitňan",
    location: "Košice",
    rating: 5,
    text:
      "Sklad s regálmi, ťažké palety. Bývalý betón sa krivil, prášil. Teraz pohoda, čistí sa to handrou. Mali sme obavy či to vydrží navážky ale zatiaľ ok.",
    category: "hala",
  },
  {
    id: "10",
    name: "Bohdana Pekárová",
    location: "Štúrovo",
    rating: 5,
    text:
      "Trochu som váhala kvôli vzhľadu, či to nebude vyzerať moc priemyselne. Ale je krásna, určite odporúčam.",
    category: "firma",
  },
  {
    id: "11",
    name: "Konštantín Drozd",
    location: "Prešov",
    rating: 5,
    text:
      "Po sebe nechali čisto, to oceňujem. Garáž po zime bez škvŕn od posypovej soli. Šiel by som do toho znova, ak má niekto skúsenosť s interiérovým využitím dajte mi vedieť.",
    category: "garaz",
  },
  {
    id: "12",
    name: "Liana Bystrická",
    location: "Bytča",
    rating: 5,
    text:
      "Jednofarebná v obývačke v byte. Známi chodia obdivovať, niektorí si aj poklepkajú či to je naozaj podlaha alebo nejaký obraz 👀 Cenu sme dohodli a nemenila sa, dávame 5/5 nožov 🔪",
    category: "dom",
  },
  {
    id: "13",
    name: "Bohuš Krištofík",
    location: "Banská Bystrica",
    rating: 5,
    text:
      "60 m² za víkend. Bez problémov. Nemusel som ich kontrolovať každú hodinu ako pri iných robotníkoch. Vedia čo robia.",
    category: "dom",
  },
  {
    id: "14",
    name: "Štefánia Mlynarčíková",
    location: "Trnava",
    rating: 5,
    text:
      "Mramor v kuchyni. S dvomi malými chalanmi je hocijaká podlaha rýchlo zničená, táto sa čistí ľahko a fugy v ktorých sa drží špina sú minulosťou 🙏",
    category: "dom",
  },
  {
    id: "15",
    name: "Rastislav Pohanka",
    location: "Považská Bystrica",
    rating: 5,
    text:
      "Garáž a dielňa, spolu cca 65 m², za 2 dni hotovo. Olejové škvrny už nie sú problém. Investícia ktorú som mal urobiť skôr 🛠️",
    category: "garaz",
  },
  {
    id: "16",
    name: "Berta Šidlíková",
    location: "Martin",
    rating: 5,
    text:
      "Chcela som niečo iné než klasiku, dlažbu alebo parkety. Navrhli mi mramorový dizajn ktorý pasuje k interiéru. Nie generické riešenie zo stránky.",
    category: "dom",
  },
  {
    id: "17",
    name: "Branko Furiel",
    location: "Trenčín",
    rating: 5,
    text:
      "V hale bol starý povrch v zlom stave. Dali to do poriadku, pripravili podklad ako treba. Vidno že to nerobia prvýkrát.",
    category: "hala",
  },
  {
    id: "18",
    name: "Zora Sivčová",
    location: "Tlmače",
    rating: 5,
    text:
      "Kuchyňa, chodba, kúpeľňa. Bez prachu, bez bordelu. Pri farbách sme dlho vyberali, boli veľmi trpezliví. Trafili sme presne 🙌",
    category: "dom",
  },
  {
    id: "19",
    name: "Imrich Klimek",
    location: "Rajec",
    rating: 5,
    text:
      "Tretia podlaha čo s nimi robím. Najprv u seba, potom u brata, teraz vo firme. Keby boli zlí asi by som ich už dávno vymenil.",
    category: "firma",
  },
  {
    id: "20",
    name: "Vladimíra Trnková",
    location: "Bratislava",
    rating: 5,
    text:
      "Showroom potreboval niečo reprezentačné. Metalická s modrastým nádychom. Klienti si ju všímajú, čo je pre nás dobrá vec. Plus sa ľahko udržiava.",
    category: "firma",
  },
  {
    id: "21",
    name: "Hugo Plichta",
    location: "Spišská Nová Ves",
    rating: 5,
    text:
      "Hobby dielňa kde si robím autá. Chipsová s antislipom, keď padne olej, handra a hotovo 🚗 Žiadne fľaky ako mal starý betón.",
    category: "garaz",
  },
  {
    id: "22",
    name: "Anastázia Tribulová",
    location: "Lednické Rovne",
    rating: 5,
    text:
      "Mali sme staré PVC z 90-tych rokov, hrozné. Teraz to vyzerá ako nový dom. Komunikácia priama, bez kecov.",
    category: "dom",
  },
  {
    id: "23",
    name: "Vincent Galko",
    location: "Liptovský Mikuláš",
    rating: 5,
    text:
      "Kaviareň 120 m², mramor s tmavými žilkami. Hostia si ju fotia, nie raz som videl ako si fotia kávu a podlahu naraz ☕ Dávame im kontakt.",
    category: "firma",
  },
  {
    id: "24",
    name: "Dagmar Račová",
    location: "Senica",
    rating: 5,
    text:
      "Garáž bol môj projekt, chcela som ju mať pekne. Vyberala som farby chipsov, finálny lesk, všetko presne podľa predstavy. Spokojnosť.",
    category: "garaz",
  },
  {
    id: "25",
    name: "Stanislav Žiak",
    location: "Banská Štiavnica",
    rating: 5,
    text:
      "Remeselná dielňa. Kyseliny, oleje, ťažké stroje. Po roku v poriadku 💪 Bál som sa že to nevydrží ale chalani vedeli čo odporučiť.",
    category: "firma",
  },
  {
    id: "26",
    name: "Bohumila Halmová",
    location: "Bošany",
    rating: 5,
    text:
      "Dvojgaráž za víkend. Autá sme parkovali už od soboty. Pekná práca, určite odporúčam ďalej 👍",
    category: "garaz",
  },
  {
    id: "27",
    name: "Branislav Bachratý",
    location: "Žilina",
    rating: 5,
    text:
      "Showroom, kombinácia jednofarebnej a metalického efektu. Navrhli to oni, mne sa to páčilo, schválil som. Cena, kvalita, termín, sedelo všetko.",
    category: "firma",
  },
  {
    id: "28",
    name: "Henrieta Mihaliková",
    location: "Mojmírovce",
    rating: 5,
    text:
      "Kuchyňa s jedálňou, biela jednofarebná, žiadne prechody, žiadne fugy. Bola to časť väčšej rekonštrukcie a stihli sa zaradiť do nášho harmonogramu, čo bolo dôležité.",
    category: "dom",
  },

  {
    id: "29",
    name: "Marek Polák",
    location: "Žilina",
    rating: 5,
    text:
      "Výrobná hala 450 m². Robili počas firemnej dovolenky, čo nám sedelo. Pri otvorení už bolo všetko hotové, žiadny výpadok výroby 🏭 To je pre nás kľúčové.",
    category: "hala",
  },
  {
    id: "30",
    name: "Peter Krajčík",
    location: "Trenčín",
    rating: 5,
    text:
      "Servis s 6 zdvihákmi. Chipsová s antislipom. Olejové škvrny sa už nestratia do betónu ako predtým, utrieš a hotovo. Po 18 mesiacoch bez opotrebenia.",
    category: "hala",
  },
  {
    id: "31",
    name: "Lucia Bachratá",
    location: "Banská Bystrica",
    rating: 5,
    text:
      "Pre kaviareň sme hľadali niečo medzi pekné a prakticky umývateľné. Mramor s tmavými žilami, hostia si ju fotia ☕ Funguje to presne ako sme dúfali.",
    category: "firma",
  },
  {
    id: "32",
    name: "Daniel Hutta",
    location: "Košice",
    rating: 5,
    text:
      "Sklad 1 200 m², ťažké VZV denne. Po roku bez praskliny, čo sa pri tomto type prevádzky nie vždy podarí. Profesionáli, papiere tiež v poriadku, protokol o odovzdaní a všetko.",
    category: "hala",
  },
  {
    id: "33",
    name: "Andrea Šimková",
    location: "Modra",
    rating: 5,
    text:
      "Fitness centrum 800 m². Polyuretán s tlmením, zvláda padajúce činky aj denný traffic 💪 Klienti chvália aj to že to nehrká pri behu. Cena výkon top.",
    category: "firma",
  },
  {
    id: "34",
    name: "Tomáš Janošík",
    location: "Liptovský Mikuláš",
    rating: 5,
    text:
      "Stolárska dielňa 380 m². Chemická odolnosť proti lakom, antistatika kvôli prachu ⚡ Pracovali cez víkend, v pondelok sme bežne fungovali.",
    category: "hala",
  },
];
