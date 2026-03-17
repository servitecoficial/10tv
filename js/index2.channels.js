const APP_CATALOG = [
    {
        id: "favoritos",
        title: "Favoritos",
        description: "Tus accesos rapidos guardados.",
        dynamic: "favorites"
    },
    {
        id: "streaming",
        title: "Canales en vivo",
        description: "Noticias, radios y senales abiertas.",
        items: [
            { id: "tn", name: "TN", type: "yt", ytId: "cb12KmMMDJA", logo: "https://upload.wikimedia.org/wikipedia/commons/9/98/Tn_logo12.png", description: "Noticias en vivo" },
            { id: "c5n", name: "C5N", type: "yt", ytId: "SF06Qy1Ct6Y", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c9/C5N_Logo_2015.PNG", description: "Cobertura informativa" },
             { id: "A 24", name: "A24", type: "hls", url: "https://dai.google.com/linear/hls/pa/event/Txk1vDlZR2CCfDuUZ0ylpw/stream/1d1983b1-1f7d-45ce-b621-371e62abbe5b:SCL2/variant/b20e54831be1870c77de57c177c43ab4/bandwidth/2800000.m3u8", logo: "https://www.a24.com/assets/img/296/header-logo-v2.svg", description: "Noticias" },
            { id: "canal26", name: "Canal 26", type: "yt", ytId: "5pGvInH-lWw", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Canal26_logo.png", description: "Actualidad y debates" },
            { id: "telefe-noticias", name: "Telefe Noticias", type: "yt", ytId: "XhAYcYpPzTc", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Telefe_Noticias_logo_2018.svg/1024px-Telefe_Noticias_logo_2018.svg.png", description: "Informativo Telefe" },
            { id: "urbana-play", name: "Urbana Play", type: "yt", ytId: "fE78C91mD4I", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Urbana_Play_logo.svg/1200px-Urbana_Play_logo.svg.png", description: "Radio con video" },
            { id: "vorterix", name: "Vorterix", type: "yt", ytId: "qfE3SjV8Wp0", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Vorterix_logo.svg/1200px-Vorterix_logo.svg.png", description: "Musica y stream" }
        ]
    },
    {
        id: "deportes-premium",
        title: "Canales deportivos",
        description: "Tu lista premium de deportes.",
        items: [
            { id: "tyc-sports", name: "TyC Sports", type: "hls", url: "https://yce5o.envivoslatam.org/tycsports/tracks-v1a1/mono.m3u8?ip=201.177.100.130&token=15c14043638b751901d3938af25fcb7a2edd0f74-4e-1773827631-1773773631", logo: "https://pelotalibretv.su/wp-content/uploads/2022/12/tyc-e1671629028653.jpg", description: "Futbol, automovilismo y eventos" },
            { id: "directv-sports", name: "DirecTV Sports", type: "hls", url: "https://bd2ih.envivoslatam.org/dsports/tracks-v1a1/mono.m3u8?ip=201.177.100.130&token=3323a960c71f3805109f1221d3bf9721a2f03279-1c-1773828636-1773774636", logo: "https://pelotalibretv.su/wp-content/uploads/2022/12/DirecTV_Sports.png", description: "Senal deportiva internacional" },
            { id: "tnt-sports", name: "TNT Sports", type: "hls", url: "https://qbk4f.envivoslatam.org/tntsports/tracks-v1a1/mono.m3u8?ip=201.177.100.130&token=d93c4a546d3ee22617f5ea884cda64e5d54835c1-60-1773828772-1773774772", logo: "https://pelotalibretv.su/wp-content/uploads/2022/12/TNT_Sports-e1671628894478.png", description: "Liga y copas" },
            { id: "espn-1", name: "ESPN 1", type: "hls", url: "https://xky9q.envivoslatam.org/espnar/tracks-v1a1/mono.m3u8?ip=201.177.100.130&token=2d968cace9a3edc5e1632a23848f364e9d5e2881-e6-1773828875-1773774875", logo: "https://pelotalibretv.su/wp-content/uploads/2022/12/espn.jpg", description: "Eventos en vivo y analisis" },
            { id: "espn-premium", name: "ESPN Premium", type: "hls", url: "https://wf6kt.envivoslatam.org/espnpremium/tracks-v1a1/mono.m3u8?ip=201.177.100.130&token=3d54a683d56167b3cec608595af2ee715a04267c-1f-1773828974-1773774974", logo: "https://pelotalibretv.su/wp-content/uploads/2022/12/ESPN_Premium-1-e1671629245648-300x221.png", description: "Premium futbol y shows" },
            { id: "fox-sports", name: "Fox Sports", type: "hls", url: "https://afy4c.envivoslatam.org/foxsports/tracks-v1a1/mono.m3u8?ip=201.177.100.130&token=f4b68a7b200a673c99c5f9bf4b254bf78f2ac914-34-1773829039-1773775039", logo: "https://pelotalibretv.su/wp-content/uploads/2022/12/Fox_Sports-e1671629328815-300x221.png", description: "Motorsport y futbol" },
            { id: "tudn", name: "TUDN", type: "hls", url: "https://ub2dr.envivoslatam.org/tudn_usa/tracks-v1a1/mono.m3u8?ip=201.177.100.130&token=ac2f8e20494a709f7cc9deaa7a6019f43c2b03b6-71-1773829137-1773775137", logo: "https://pelotalibretv.su/wp-content/uploads/2022/12/tudn.jpg", description: "Cobertura deportiva USA" },
           
        ]
    },
    {
        id: "listas-globales",
        title: "Mas listas",
        description: "Sublistas para seguir ampliando el catalogo.",
        items: [
            { id: "argentina", name: "Argentina", type: "playlist", url: "https://iptv-org.github.io/iptv/countries/ar.m3u", logo: "https://flagcdn.com/w160/ar.png", description: "Canales abiertos y regionales" },
            { id: "deportes-mundo", name: "Deportes del mundo", type: "playlist", url: "https://iptv-org.github.io/iptv/categories/sports.m3u", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Olympic_rings_without_rims.svg/1200px-Olympic_rings_without_rims.svg.png", description: "Categoria deportiva internacional" },
            { id: "espana", name: "Espana", type: "playlist", url: "https://iptv-org.github.io/iptv/countries/es.m3u", logo: "https://flagcdn.com/w160/es.png", description: "Senales espanolas" },
            { id: "mexico", name: "Mexico", type: "playlist", url: "https://iptv-org.github.io/iptv/countries/mx.m3u", logo: "https://flagcdn.com/w160/mx.png", description: "TV abierta y cultura" },
            { id: "pluto-es", name: "Pluto TV Series", type: "playlist", url: "https://iptv-org.github.io/iptv/languages/spa.m3u", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Pluto_TV_logo.svg/1200px-Pluto_TV_logo.svg.png", description: "Canales tematicos en espanol" }
        ]
    },
    {
        id: "musica-247",
        title: "Musica y 24/7",
        description: "Listas para dejar de fondo.",
        items: [
            { id: "la100", name: "La 100", type: "yt", ytId: "vS-7F3H9P3w", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_100_logo.svg/1200px-La_100_logo.svg.png", description: "Radio musical" },
            { id: "radio-mitre", name: "Radio Mitre", type: "yt", ytId: "P_v97W6-p9E", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Radio_Mitre_logo.svg/1200px-Radio_Mitre_logo.svg.png", description: "Radio en vivo" },
            { id: "tv-publica", name: "TV Publica", type: "yt", ytId: "3N7G9S_3H_Y", logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Canal_7_Argentina_logo_2022.png", description: "Programacion oficial" }
        ]
    }
];

/*
Como agregar tus propias listas por link:

1. Crea un nuevo bloque dentro de APP_CATALOG, por ejemplo:
{
    id: "mis-listas",
    title: "Mis listas",
    description: "Listas agregadas por mi",
    items: [
        {
            id: "lista-ejemplo",
            name: "Mi lista M3U",
            type: "playlist",
            url: "https://misitio.com/mi-lista.m3u",
            logo: "https://misitio.com/logo.png",
            description: "Canales cargados desde mi link"
        }
    ]
}

2. Si quieres agregar un canal directo en vez de una lista:
{
    id: "mi-canal",
    name: "Mi canal",
    type: "hls",
    url: "https://misitio.com/stream.m3u8",
    logo: "https://misitio.com/logo.png",
    description: "Streaming directo"
}
*/
