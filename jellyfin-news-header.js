(() => {
    'use strict';

    /*
     * Change this value whenever you publish a new announcement. A new value
     * creates a new localStorage key, so users will see the announcement again.
     */
    const NEWS_ID = 'jellyfin-release-10-10-0';
    const STORAGE_KEY = `jellyfin-news-dismissed:${NEWS_ID}`;
    const CONTAINER_ID = `jellyfin-news-${NEWS_ID}`;

    // Edit this trusted HTML to describe the latest release.
    const NEWS_CONTENT = `
        <p><strong>Nejnovější verze Jellyfinu je tady!</strong></p>
        <p>
            Přidali jsme rychlejší načítání knihovny, vylepšené titulky
            a několik oprav přehrávání na mobilních zařízeních.
        </p>
        <ul>
            <li>přehlednější obrazovka přehrávače,</li>
            <li>spolehlivější synchronizace sledovaného obsahu,</li>
            <li>další opravy a vylepšení výkonu.</li>
        </ul>
        <p>Podrobnosti najdete v <a href="https://jellyfin.org/docs/" target="_blank" rel="noopener noreferrer">poznámkách k vydání</a>.</p>
    `;

    const STYLE_ID = 'jellyfin-news-header-styles';

    function isDismissed() {
        try {
            return window.localStorage.getItem(STORAGE_KEY) === 'dismissed';
        } catch (error) {
            console.warn('[Jellyfin news] Unable to read localStorage.', error);
            return false;
        }
    }

    function dismiss() {
        try {
            window.localStorage.setItem(STORAGE_KEY, 'dismissed');
        } catch (error) {
            console.warn('[Jellyfin news] Unable to save dismissal.', error);
        }
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #${CONTAINER_ID} {
                box-sizing: border-box;
                margin: 0 0 1.5em;
                padding: 1em 1.25em;
                border-left: 4px solid var(--theme-primary-color, #00a4dc);
                border-radius: 4px;
                color: var(--primary-text-color, inherit);
                background: var(--card-background-color, rgba(255, 255, 255, 0.08));
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
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
        const announcement = document.createElement('details');
        announcement.id = CONTAINER_ID;
        announcement.className = 'jellyfin-news-header';
        announcement.open = true;
        announcement.innerHTML = `
            <summary>Co je nového</summary>
            <div class="jellyfin-news-body">
                <button class="jellyfin-news-dismiss" type="button" title="Skrýt toto oznámení">×</button>
                ${NEWS_CONTENT}
            </div>
        `;

        announcement.querySelector('.jellyfin-news-dismiss').addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            dismiss();
            announcement.remove();
        });

        return announcement;
    }

    function insertAnnouncement() {
        const homeTab = document.querySelector('#homeTab');
        if (!homeTab || isDismissed() || document.getElementById(CONTAINER_ID)) {
            return;
        }

        addStyles();
        homeTab.prepend(createAnnouncement());
    }

    insertAnnouncement();

    // Jellyfin replaces the home view during navigation, so retry when its DOM changes.
    const observer = new MutationObserver(insertAnnouncement);
    observer.observe(document.body, { childList: true, subtree: true });
})();
