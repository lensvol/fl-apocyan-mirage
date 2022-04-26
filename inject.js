(function () {
    const DONE = 4;
    const UNKNOWN = -1;
    const TARGET_SETTING = 107952;
    const TARGET_AREA = 111187;

    let currentSettingId = UNKNOWN;
    let currentAreaId = UNKNOWN;
    let authToken = null;

    function createApocyanicBox() {
        return {
            allowedOn: "Character",
            availableAt: "Bring your empty mirrorcatch-box to the special location somewhere on the Zee, " +
                "filled with apocyan light and implications.",
            category: "Contraband",
            description: "Filled to the brim by the elusive light refracted from the Zee-waves. " +
                    "It reminds you of something, of a memory consigned to olivion.",
            effectiveLevel: 1,
            enhancements: [],
            equippable: false,
            himbleLevel: 6,
            id: 7_777_777 + 1,
            image: "apocyanic",
            level: 1,
            name: "Apocyan-filled Mirrorcatch Box",
            nameAndLevel: "1 x Apocyan-filled Mirrorcatch Box",
            nature: "Thing",
            progressAsPercentage: 0,
            qualityPossessedId: -1
        }
    }

    function parseResponse(response) {
        if (this.readyState !== DONE) {
            return;
        }

        let targetUrl = response.currentTarget.responseURL;

        if (!((targetUrl.includes("/api/map") || targetUrl.includes("/choosebranch") || targetUrl.includes("/myself")) && targetUrl.includes("fallenlondon"))) {
            return;
        }

        let data = JSON.parse(response.target.responseText);

        if (targetUrl.endsWith("/api/map")) {
            if (data.isSuccess) {
                currentAreaId = data["currentArea"].id;
                console.log(`[FL Apocyan Mirage] We are at area ID: ${data["currentArea"].id}`);
            } else if (currentAreaId === UNKNOWN) {
                console.log("[FL Apocyan Mirage] Map cannot be accessed & location unknown, detecting through user info...")

                getAreaFromUserInfo()
                    .then(area => {
                        console.log(`[FL Apocyan Mirage] User is now at ${area.id}`);
                        currentAreaId = area.id;
                    });

                return;
            }
        }

        if (targetUrl.endsWith("/api/map/move")) {
            currentAreaId = data["area"].id;
            console.log(`[FL Apocyan Mirage] We have moved to area ID ${currentAreaId}`);
        } else if (targetUrl.endsWith("/api/storylet/choosebranch")) {
            if ("messages" in data) {
                data.messages.forEach((message) => {
                    if ("area" in message) {
                        currentAreaId = message.area.id;

                        console.log(`[FL Apocyan Mirage] We transitioned to ${currentAreaId}`);
                    } else if ("setting" in message) {
                        currentSettingId = message.setting.id;

                        console.log(`[FL Apocyan Mirage] New setting: ${currentSettingId}`);
                    }
                })
            }
        }

        if (response.currentTarget.responseURL.includes("/api/character/myself")) {
            currentSettingId = data.character.setting.id;
            console.log(`[FL Apocyan Mirage] Current setting ID: ${currentSettingId}`);

            const contraband = data.possessions.find(category => category.name === "Contraband");
            if (contraband == null) {
                return;
            }

            contraband.possessions.push(createApocyanicBox());

            setFakeXhrResponse(this, 200, JSON.stringify(data));
        }
    }

    function openBypass(original_function) {
        return function (method, url, async) {
            this.addEventListener("readystatechange", parseResponse);
            return original_function.apply(this, arguments);
        };
    }

    function setFakeXhrResponse(request, status, responseText) {
        Object.defineProperty(request, 'responseText', {writable: true});
        Object.defineProperty(request, 'readyState', {writable: true});
        Object.defineProperty(request, 'status', {writable: true});

        request.responseText = responseText;
        request.readyState = DONE;
        request.status = 200;

        request.onreadystatechange();
    }

    async function getAreaFromUserInfo() {
        console.debug("[FL Apocyan Mirage] Trying to fetch user info from server...");
        const response = await fetch(
            "https://api.fallenlondon.com/api/login/user",
            {
                headers: {
                    "Authorization": authToken,
                },
            }
        );
        if (!response.ok) {
            throw new Error("FL API did not like our request");
        }

        const userData = await response.json();
        return userData.area;
    }

    function installAuthSniffer(original_function) {
        return function (name, value) {
            if (name === "Authorization" && value !== authToken) {
                authToken = value;
                console.debug("[FL Apocyan Mirage] Got FL auth token!");
            }
            return original_function.apply(this, arguments);
        }
    }

    console.debug("[FL Apocyan Mirage] Setting up API interceptors.");
    XMLHttpRequest.prototype.open = openBypass(XMLHttpRequest.prototype.open);
    XMLHttpRequest.prototype.setRequestHeader = installAuthSniffer(XMLHttpRequest.prototype.setRequestHeader);
}())
