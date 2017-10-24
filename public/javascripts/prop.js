var DGMeta = {
    siteURL: 'diplogift.com',
    mobileSiteURL: 'diplogift.com/m',

    //Traditional Chinese
    TC: {
        siteTitle: '台南市城市交流藝廊',
        components: {
            search: '搜尋',
            featuring: '焦點閱讀',
            recentCampaign: '近期活動',
            aboutTheSite: '關於網站',
            pastEvents: '交流存摺'
            gotoOfficialSite: '前往活動官網'
            gotoPastRelated: '交流的起源'
            readMore: '閱讀更多'
            homepage: '首頁',
            allEvents: '交流事件',
            allGifts: '所有禮品',
            try: '試試手氣',
            cancel: '取消'
        }
    }

    get: function(lang, name) {
        return DGMeta.lang.components[name];
    }

}
