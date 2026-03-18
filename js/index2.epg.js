window.EPG_CONFIG = {
    cacheKey: "epg_index2_cache_v1",
    cacheTtlMs: 30 * 60 * 1000,
    refreshUiMs: 60 * 1000,
    sources: [
        {
            id: "infotv-cl",
            url: "https://raw.githubusercontent.com/InfoTV-CL/INFOCLTV/main/guia-de-programacion.xml"
        },
        {
            id: "villafapd-locales",
            url: "https://gist.githubusercontent.com/villafapd/33508c39f7c8d4921d84835bf1744dca/raw/ListaCanalesLocales_EPG.xml"
        }
    ],
    aliases: {
        "tn": ["TN", "TN Todo Noticias", "Todo Noticias", "TN.ar"],
        "c5n": ["C5N", "C5N HD", "C5N.ar"],
        "a24": ["A24", "A24 HD", "A24.ar"],
        "canal 26": ["Canal 26", "Canal26", "Canal 26 HD", "Canal26.ar"],
        "cronica tv": ["Cronica TV", "Crónica TV", "CronicaTV", "Cronica TV HD"],
        "telefe": ["Telefe", "Telefe HD (ARG)", "Telefe.ar"],
        "telefe noticias": ["Telefe", "Telefe Noticias", "Telefe HD (ARG)", "Telefe.ar"],
        "america tv": ["America TV", "América TV", "America TV HD (ARG)", "AmericaTV.ar"],
        "tv publica": ["TV Publica", "TV Pública", "La TV Publica HD (ARG)", "TVPublica.ar"],
        "el trece": ["El Trece", "El Trece HD (ARG)", "ElTrece.ar"],
        "el nueve": ["El Nueve", "Canal 9 HD (ARG)", "ElNueve.ar"],
        "net tv": ["Net TV", "NET TV HD (ARG)", "NETTV.ar"],
        "ciudad magazine": ["Ciudad Magazine"],
        "canal de la ciudad": ["Canal de la Ciudad"],
        "argentinisima": ["Argentinisima", "Argentinisima Satelital", "ArgentinisimaSatelital.ar"],
        "la 100": ["La 100", "Radio La 100"],
        "radio mitre": ["Radio Mitre"],
        "tyc sports": ["TyC Sports", "TyC Sports HD", "TyCSports"],
        "directv sports": ["DirecTV Sports", "DSports", "DSports HD"],
        "tnt sports": ["TNT Sports", "TNT Sports Premium", "TNT Sports HD"],
        "espn 1": ["ESPN 1", "ESPN", "ESPN HD"],
        "espn premium": ["ESPN Premium", "Fox Sports Premium", "ESPN Premium HD"],
        "fox sports": ["Fox Sports", "FOX Sports", "FOX Sports 1", "Fox Sports 1"],
        "tudn": ["TUDN", "TUDN USA"]
    }
};
