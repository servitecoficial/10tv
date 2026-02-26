const categorias = {
    "CANALES EN STREAMING": [
        // NOTICIAS (YouTube Live)
        { name: "TN", id: "cb12KmMMDJA", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Todo_Noticias_2016.png" },
        { name: "C5N", id: "SF06Qy1Ct6Y", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/C5N_Logo_2017.svg/1200px-C5N_Logo_2017.svg.png" },
        { name: "A24", id: "ArKbAx1K-2U", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/A24_logo_2021.svg/1200px-A24_logo_2021.svg.png" },
        { name: "LN+", id: "M_gUd2Bp9g0", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/La_Naci%C3%B3n_%2B_logo.svg/1200px-La_Naci%C3%B3n_%2B_logo.svg.png" },
        { name: "CRÓNICA TV", id: "gS8m_p_i-zM", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Cr%C3%B3nica_TV_logo_2017.svg/1200px-Cr%C3%B3nica_TV_logo_2017.svg.png" },
        { name: "CANAL 26", id: "5pGvInH-lWw", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Canal26_logo.png" },
        { name: "TELEFE NOTICIAS", id: "XhAYcYpPzTc", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Telefe_Noticias_logo_2018.svg/1024px-Telefe_Noticias_logo_2018.svg.png" },
        { name: "TV PÚBLICA", id: "3N7G9S_3H_Y", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Canal_7_Argentina_logo_2022.png" },
        
        // RADIOS CON VIDEO (Streaming)
        { name: "URBANA PLAY", id: "fE78C91mD4I", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Urbana_Play_logo.svg/1200px-Urbana_Play_logo.svg.png" },
        { name: "VORTERIX", id: "qfE3SjV8Wp0", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Vorterix_logo.svg/1200px-Vorterix_logo.svg.png" },
        { name: "LA 100", id: "vS-7F3H9P3w", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_100_logo.svg/1200px-La_100_logo.svg.png" },
        { name: "RADIO MITRE", id: "P_v97W6-p9E", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Radio_Mitre_logo.svg/1200px-Radio_Mitre_logo.svg.png" },
        { name: "ASPEN 102.3", id: "v0x0P-nBv2I", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Aspen_102.3_logo.png" },
        { name: "RADIO CON VOS", id: "XpE3SjV8Wp0", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Radio_Con_Vos_logo.svg/1200px-Radio_Con_Vos_logo.svg.png" }
    ],
    "PLUTO TV & EXTRAS": [
        { 
            name: "24/7 (Series Pluto)", 
            url: "https://iptv-org.github.io/iptv/languages/spa.m3u", 
            isCountry: true, 
            code: "es",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Pluto_TV_logo.svg/1200px-Pluto_TV_logo.svg.png" 
        },
        { 
            name: "MÁS ARGENTINA", 
            url: "https://iptv-org.github.io/iptv/countries/ar.m3u", 
            isCountry: true, 
            code: "ar",
            logo: "https://flagcdn.com/w160/ar.png" 
        },
        { 
            name: "DEPORTES (FIFA+)", 
            url: "https://iptv-org.github.io/iptv/categories/sports.m3u", 
            isCountry: true, 
            code: "un", 
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/FIFA_logo_without_slogan.svg/1200px-FIFA_logo_without_slogan.svg.png"
        }
    ],
    "GLOBAL TV": [
        { name: "ARGENTINA", code: "ar", url: "https://iptv-org.github.io/iptv/countries/ar.m3u", isCountry: true },
        { name: "BOLIVIA", code: "bo", url: "https://iptv-org.github.io/iptv/countries/bo.m3u", isCountry: true },
        { name: "BRASIL", code: "br", url: "https://iptv-org.github.io/iptv/countries/br.m3u", isCountry: true },
        { name: "CHILE", code: "cl", url: "https://iptv-org.github.io/iptv/countries/cl.m3u", isCountry: true },
        { name: "COLOMBIA", code: "co", url: "https://iptv-org.github.io/iptv/countries/co.m3u", isCountry: true },
        { name: "COSTA RICA", code: "cr", url: "https://iptv-org.github.io/iptv/countries/cr.m3u", isCountry: true },
        { name: "CUBA", code: "cu", url: "https://iptv-org.github.io/iptv/countries/cu.m3u", isCountry: true },
        { name: "ECUADOR", code: "ec", url: "https://iptv-org.github.io/iptv/countries/ec.m3u", isCountry: true },
        { name: "EL SALVADOR", code: "sv", url: "https://iptv-org.github.io/iptv/countries/sv.m3u", isCountry: true },
        { name: "ESPAÑA", code: "es", url: "https://iptv-org.github.io/iptv/countries/es.m3u", isCountry: true },
        { name: "GUATEMALA", code: "gt", url: "https://iptv-org.github.io/iptv/countries/gt.m3u", isCountry: true },
        { name: "HONDURAS", code: "hn", url: "https://iptv-org.github.io/iptv/countries/hn.m3u", isCountry: true },
        { name: "MÉXICO", code: "mx", url: "https://iptv-org.github.io/iptv/countries/mx.m3u", isCountry: true },
        { name: "NICARAGUA", code: "ni", url: "https://iptv-org.github.io/iptv/countries/ni.m3u", isCountry: true },
        { name: "PANAMÁ", code: "pa", url: "https://iptv-org.github.io/iptv/countries/pa.m3u", isCountry: true },
        { name: "PARAGUAY", code: "py", url: "https://iptv-org.github.io/iptv/countries/py.m3u", isCountry: true },
        { name: "PERÚ", code: "pe", url: "https://iptv-org.github.io/iptv/countries/pe.m3u", isCountry: true },
        { name: "PUERTO RICO", code: "pr", url: "https://iptv-org.github.io/iptv/countries/pr.m3u", isCountry: true },
        { name: "REP. DOMINICANA", code: "do", url: "https://iptv-org.github.io/iptv/countries/do.m3u", isCountry: true },
        { name: "URUGUAY", code: "uy", url: "https://iptv-org.github.io/iptv/countries/uy.m3u", isCountry: true },
        { name: "VENEZUELA", code: "ve", url: "https://iptv-org.github.io/iptv/countries/ve.m3u", isCountry: true }
    ],
    "DEPORTES": [
        { name: "TYC SPORTS", url: "https://d320m3arb2wo8b.cloudfront.net/out/v1/34e0da501a8c4489b713809eb08a9bf3/index.m3u8", type: "m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ab/TyC_Sports_logo_2015.png" },
        { name: "SKY SPORTS", url: "https://sdmx.vip:443/belpley/sYqKZQrTZa/2092605", type: "m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Sky_Sports_logo_2020.svg/1200px-Sky_Sports_logo_2020.svg.png" },
        { name: "ESPN", url: "http://offshore.lat:8080/play/xknfF6QKbQnlCvS51ULeiko8hkRCt0L8Rp3JgOdWbEXn4MLNstO02YGaIQk7Vj7_", type: "m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/ESPN_logo.svg/1200px-ESPN_logo.svg.png" },
        { name: "FOX SPORTS", url: "https://d2zihajm9p6p5f.cloudfront.net/out/v1/5a6a683a48e64c5d98a00062f90a9317/index.m3u8", type: "m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Fox_Sports_logo.svg/1200px-Fox_Sports_logo.svg.png" },
        { name: "REAL MADRID TV", url: "https://rmtv-atsc.akamaized.net/hls/live/2043149/rmtv-atsc-en/master.m3u8", type: "m3u8", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png" }
    ],
    "24/7": [
        { name: "EL CHAVO", id: "fy_fYd3ZwPE", type: "yt", logo: "https://via.placeholder.com/100/ff0000/ffffff?text=CHAVO" },
        { name: "MASHA Y EL OSO", id: "8ZTe5n_SFfg", type: "yt", logo: "https://via.placeholder.com/100/ff0000/ffffff?text=MASHA" },
        { name: "TOM Y JERRY", id: "P2mSCD95vU0", type: "yt", logo: "https://via.placeholder.com/100/ff0000/ffffff?text=TOM+JERRY" }
    ],
    "VIP PREMIUM": [
        { name: "TELEFE HD", url: "http://ar.watcha.live/ch6/hi.m3u8", type: "m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Telefe_logo.svg/1200px-Telefe_logo.svg.png" },
        { name: "EL TRECE", url: "http://ar.watcha.live/ch7/hi.m3u8", type: "m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Logo_de_eltrece.svg/1200px-Logo_de_eltrece.svg.png" },
        { name: "HBO PREMIUM", url: "http://tvlatino.live:8080/Martv1971/G5cSzPMeRUuH/76705.m3u8", type: "m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/1200px-HBO_logo.svg.png" }
    ]
};