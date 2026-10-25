(() => {
    "use strict";

    /*
     * Change this value whenever you publish a new announcement. A new value
     * creates a new localStorage key, so users will see the announcement again.
     */
    const NEWS_ID = "jellyfin-release-2026-10-25";
    const STORAGE_KEY = `jellyfin-news-dismissed:${NEWS_ID}`;
    const CONTAINER_ID = `jellyfin-news-${NEWS_ID}`;

    // Edit this trusted HTML to describe the latest release.
    const NEWS_TITLE = "Novinky v Jellyfinu (25. 10. 2026)";
    const NEWS_CONTENT = `
        <p><strong>Máme tu balík novinek, které nechceš přehlédnout!</strong></p>
        <ul>
            <li><strong>Lepší vyhledávání:</strong> Nahradil jsem pomalý plugin pro Seerr rychlejším JE Enhanced. Nové filmy a seriály můžete pořád hledat klasicky ve vyhledávání, nebo se podívat na <i class="material-icons">auto_awesome</i> <a href="#/home?tab=2&jeTab=recommendations">Doporučení</a>. Svoje stahování můžete kontrolovat pod ikonkou <i class="material-icons">download</i> <a href="#/home?tab=3&jeTab=requests">Stahování</a> vpravo nahoře. </li>
            <li><strong>Komunitní hodnocení:</strong> Podělte se o filmy a seriály, které se vám líbily a nelíbily. Na stránce každého filmu či seriálu nově najdete sekci Recenze, kam můžete přidatsvoje hodnocení ať už hvězdičkami, nebo i slovy. Na filmy, které hodnotili ostatní se můžete podívat vpravo nahoře pod ikonkou <i class="material-icons">history</i> <a href="#/home?tab=7&jeTab=activity">Aktivity</a>.</li>
            <li><strong>Kalendář nových dílů:</strong> Zajímá vás, kdy vychází další díl vašeho oblíbeného seriálu? Koukněte se do <i class="material-icons">calendar_month</i> <a href="#/home?tab=2&jeTab=calendar">Kalendáře</a> vpravo nahoře.</li>
            <li><strong>Watchlist:</strong> Chcete se na film či seriál podívat později? Přidejte ho do svého <i class="material-icons">bookmark</i> <a href="#/watchlist">Watchlistu</a> a neztratíte ho.</li>
            <li><strong>Další novinky:</strong> Pokud hledáte inspiraci, můžete si nechat vygenerovat <i class="material-icons">casino</i> Náhodný film, nebo zkusit dohnat, co vám uniklo pomocí <i class="material-icons">style</i> <a href="#/userpluginsettings.html?pageUrl=/JellyfinEnhanced/catchUpPage">Catch Up</a>.</li>
        </ul>
        <p>Doufám, že se vám tu líbí, kdybyste narazili na problém, dejte mi vědět <i class="material-icons">favorite</i>.</p>
        <p>— Jonáš</p>
    `;

    const STYLE_ID = "jellyfin-news-header-styles";
    let lastInsertStatus;

    function log(message, details) {
        if (details === undefined) {
            console.info(`[Jellyfin news] ${message}`);
        } else {
            console.info(`[Jellyfin news] ${message}`, details);
        }
    }

    function logInsertStatus(status, details) {
        if (status === lastInsertStatus) {
            return;
        }

        lastInsertStatus = status;
        log(status, details);
    }

    function isDismissed() {
        try {
            const dismissed =
                window.localStorage.getItem(STORAGE_KEY) === "dismissed";
            logInsertStatus(
                dismissed
                    ? "Announcement is dismissed."
                    : "Announcement is not dismissed.",
                { storageKey: STORAGE_KEY },
            );
            return dismissed;
        } catch (error) {
            console.warn("[Jellyfin news] Unable to read localStorage.", error);
            return false;
        }
    }

    function dismiss() {
        try {
            window.localStorage.setItem(STORAGE_KEY, "dismissed");
        } catch (error) {
            console.warn("[Jellyfin news] Unable to save dismissal.", error);
        }
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
            #${CONTAINER_ID} {
                box-sizing: border-box;
                margin: 0 0 1.5em;
                padding: 1em 1.25em;
                border: var(--defaultBorder);
                border-left: 4px solid var(--theme-primary-color, #00a4dc);
                border-radius: var(--largerRadius);
                color: var(--primary-text-color, inherit);
                background: var(--card-background-color, rgba(255, 255, 255, 0.08));
                box-shadow: var(--cardShadow);
            }

            #${CONTAINER_ID} summary {
                display: flex;
                align-items: center;
                gap: 0.6em;
                cursor: pointer;
                color: var(--theme-primary-color, #00a4dc);
                font-weight: 600;
                list-style: none;
            }

            #${CONTAINER_ID} summary .jellyfin-news-dismiss {
                margin: 0 0 0 auto;
            }

            #${CONTAINER_ID} summary::-webkit-details-marker {
                display: none;
            }

            #${CONTAINER_ID} summary::before {
                content: '›';
                display: inline-block;
                font-size: 1.4em;
                line-height: 0.7;
                transition: transform 150ms ease;
            }

            #${CONTAINER_ID}[open] summary::before {
                transform: rotate(90deg);
            }

            #${CONTAINER_ID} .jellyfin-news-body {
                padding: 0.75em 0 0.25em 1.75em;
            }

            #${CONTAINER_ID} .jellyfin-news-body > :first-child {
                margin-top: 0;
            }

            #${CONTAINER_ID} .jellyfin-news-body > :last-child {
                margin-bottom: 0;
            }

            #${CONTAINER_ID} .jellyfin-news-dismiss {
                float: right;
                margin: 0 0 0.5em 1em;
                padding: 0.35em 0.65em;
                border: 1px solid currentColor;
                border-radius: 4px;
                color: inherit;
                background: transparent;
                cursor: pointer;
                opacity: 0.8;
            }

            #${CONTAINER_ID} .jellyfin-news-dismiss:hover,
            #${CONTAINER_ID} .jellyfin-news-dismiss:focus-visible {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }

    function createAnnouncement() {
        const announcement = document.createElement("details");
        announcement.id = CONTAINER_ID;
        announcement.className = "jellyfin-news-header";
        announcement.innerHTML = `
            <summary>
                <span>${NEWS_TITLE}</span>
                <button class="jellyfin-news-dismiss" type="button" title="Skrýt toto oznámení">×</button>
            </summary>
            <div class="jellyfin-news-body">
                ${NEWS_CONTENT}
            </div>
        `;

        announcement
            .querySelector(".jellyfin-news-dismiss")
            .addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                dismiss();
                announcement.remove();
            });

        return announcement;
    }

    function insertAnnouncement() {
        const homeTab = document.querySelector("#homeTab");
        if (!homeTab) {
            logInsertStatus("Waiting for #homeTab.");
            return;
        }

        if (isDismissed()) {
            return;
        }

        if (document.getElementById(CONTAINER_ID)) {
            logInsertStatus("Announcement is already present.");
            return;
        }

        addStyles();
        // The sections container is where Jellyfin renders the home content.
        // Falling back to the tab itself keeps this compatible with older
        // Jellyfin versions that do not have that container yet.
        const homeContent = homeTab.querySelector(".sections") || homeTab;
        const wrapper = document.createElement("div");
        wrapper.className = "padded-left padded-right";
        wrapper.append(createAnnouncement());
        homeContent.prepend(wrapper);
        logInsertStatus("Announcement inserted.", {
            target: homeContent === homeTab ? "#homeTab" : "#homeTab .sections",
        });
    }

    function start() {
        // Custom JavaScript can be evaluated before <body> exists.
        if (!document.body) {
            log("Script loaded; waiting for DOMContentLoaded.");
            document.addEventListener("DOMContentLoaded", start, {
                once: true,
            });
            return;
        }

        log("Script loaded; starting.");
        insertAnnouncement();

        // Jellyfin replaces the home view during navigation, so retry when its DOM changes.
        const observer = new MutationObserver(insertAnnouncement);
        observer.observe(document.body, { childList: true, subtree: true });
        log("Watching the document for Jellyfin view changes.");
    }

    start();
})();
