(function () {
    const DONE = 4;
    const UNKNOWN = -1;
    const TARGET_SETTING = 107952;
    const TARGET_AREA = 111187;
    const APOCYAN_POINT_STORYLET_ID = 777_777_777 + 10000 + 1;
    const CATCH_APOCYAN_BRANCH_ID = 777_777_777 + 10000 + 1;
    const KEY_APOCYAN_ACQUIRED = "mod_apocyan_acquired";

    let currentSettingId = UNKNOWN;
    let currentAreaId = UNKNOWN;
    let authToken = null;
    let actionCount = 0;
    let maxActions = 20;

    let apocyanBoxAcquired = localStorage.getItem(KEY_APOCYAN_ACQUIRED) === "yes";
    let mirrorBoxCount = 0;

    if (apocyanBoxAcquired) {
        debug("You already acquired Apocyan-filled Mirrorcatch Box.");
    } else {
        debug("You do not have yet a glimpse of apocyan...");
    }

    function debug(message) {
        console.debug(`[FL Apocyan Mirage] ${message}`);
    }

    function log(message) {
        console.log(`[FL Apocyan Mirage] ${message}`);
    }

    function createEntryStorylet() {
        return {
            category: "Green",
            buttonText: "GO",
            name: "A light off the Pigmote Isle",
            id: APOCYAN_POINT_STORYLET_ID,
            image: "scintillack",
            qualityRequirements: [],
            teaser: "Here dark waves are laced with the glimpses of the otherwordly light..."
        }
    }

    function createOpportunityStorylet() {
        const apocyanicBoxReq = {
            allowedOn: "Character",
            category: "Contraband",
            id: 7_777_777 + 1,
            image: "apocyanic",
            isCost: false,
            nature: "Thing",
            qualityId: -1,
            qualityName: "Apocyan-filled Mirrorcatch Box",
            status: apocyanBoxAcquired ? "Locked" : "Unlocked",
            tooltip: apocyanBoxAcquired ? "You cannot do this while having any Apocyan-filled Mirrorcatch Box." :
                "You unlocked this by not having any <span class='quality-name'>Apocyan-filled Mirrorcatch Box.</span>",
        }

        const mirrorBoxReq = {
            allowedOn: "Character",
            category: "Contraband",
            id: 853,
            image: "mirrorcatchboxclosed",
            isCost: false,
            nature: "Thing",
            qualityId: -1,
            qualityName: "Apocyan-filled Mirrorcatch Box",
            status: mirrorBoxCount === 0 ? "Locked" : "Unlocked",
            tooltip: mirrorBoxCount === 0 ? "You need a Mirrorcatch Box." :
                `You unlocked this with ${mirrorBoxCount} <span class='quality-name'>Mirrorcatch Box</span><em> (you needed 1).</em>`,
        }

        return {
            actions: actionCount,
            canChangeOutfit: true,
            isSuccess: true,
            phase: "In",
            storylet: {
                childBranches: [
                    {
                        name: "Catch a glimpse of the apocyan",
                        description: "For this you will need a mirrorcatch box and a strong desire to risk your life " +
                            "for something completely different.",
                        actionCost: 0,
                        actionLocked: false,
                        challenges: [],
                        currencyCost: 0,
                        currencyLocked: false,
                        id: CATCH_APOCYAN_BRANCH_ID,
                        image: "apocyanic",
                        isLocked: false,
                        ordering: 0,
                        buttonText: "DO IT",
                        planKey: "awakesAPOCYANtheblueofmemoryandbrightestcoral",
                        qualityLocked: apocyanBoxAcquired || mirrorBoxCount === 0,
                        qualityRequirements: [
                            apocyanicBoxReq,
                            mirrorBoxReq,
                        ],
                    }
                ],
                description: "Here dark waves are laced with the glimpses of the otherwordly light...",
                distribution: 0,
                frequency: "Always",
                id: APOCYAN_POINT_STORYLET_ID,
                image: "scintillack",
                isInEventUseTree: false,
                isLocked: false,
                canGoBack: true,
                name: "A light off the Pigmote Isle",
                qualityRequirements: [],
                teaser: "Why do we wear faces, again?",
                urgency: "Normal",
            },
        }
    }

    function createMirrorcatchBox() {
        return {
            allowedOn: "Character",
            availableAt: "Empty Mirrorcatch Boxes can be obtained at the Fiddler's Scarlet in Jericho Locks, or " +
                "found, rarely, in the Waswood.",
            category: "Contraband",
            description: "The best way to store light, and certain other mysterious substances. " +
                "There are few of these, and they are hotly sought-after.",
            effectiveLevel: 1,
            enhancements: [],
            equippable: false,
            himbleLevel: 4,
            id: 853,
            image: "mirrorcatchboxclosed",
            level: 1,
            name: "Mirrorcatch Box",
            nameAndLevel: "1 x Mirrorcatch Box",
            nature: "Thing",
            progressAsPercentage: 0,
            qualityPossessedId: -1,
        }
    }

    function createApocyanicBox() {
        return {
            allowedOn: "Character",
            availableAt: "Bring your empty Mirrorcatch Box to the special location somewhere on the Zee, " +
                "filled with apocyan light and implications.",
            category: "Contraband",
            description: "Filled to the brim by the elusive light refracted from the Zee-waves. " +
                "It reminds you of something, of a memory consigned to oblivion.",
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

        if (!targetUrl.includes("fallenlondon")) {
            return;
        }

        if (!((targetUrl.includes("/api/map")
            || targetUrl.includes("/storylet")
            || targetUrl.includes("/choosebranch")
            || targetUrl.includes("/api/character/actions")
            || targetUrl.includes("/myself")))) {
            return;
        }

        let data = JSON.parse(response.target.responseText);

        if (targetUrl.endsWith("/api/map")) {
            if (data.isSuccess) {
                currentAreaId = data["currentArea"].id;
                debug(`We are at area ID: ${data["currentArea"].id}`);
            } else if (currentAreaId === UNKNOWN) {
                debug("Map cannot be accessed & location unknown, detecting through user info...")

                getAreaFromUserInfo()
                    .then(area => {
                        debug(`User is now at ${area.id}`);
                        currentAreaId = area.id;
                    });

                return;
            }
        }

        if (targetUrl.endsWith("/api/character/actions")) {
            actionCount = data.actions;
            maxActions = data.actionBankSize;
        }

        if (targetUrl.endsWith("/api/map/move")) {
            currentAreaId = data["area"].id;
            debug(`We have moved to area ID ${currentAreaId}`);
        }

        if (targetUrl.endsWith("/api/storylet/choosebranch")) {
            if ("messages" in data) {
                data.messages.forEach((message) => {
                    if ("area" in message) {
                        currentAreaId = message.area.id;

                        debug(`We transitioned to ${currentAreaId}`);
                    } else if ("setting" in message) {
                        currentSettingId = message.setting.id;

                        debug(`New setting: ${currentSettingId}`);
                    }
                })
            }
        }

        if (response.currentTarget.responseURL.includes("/api/character/myself")) {
            currentSettingId = data.character.setting.id;
            debug(`Current setting ID: ${currentSettingId}`);

            if (currentAreaId === UNKNOWN) {
                debug(`Area is unknown, trying to detect via user info...`);
                getAreaFromUserInfo()
                    .then(area => {
                        debug(`User is now at ${area.id}`);
                        currentAreaId = area.id;
                    });
            }

            const contraband = data.possessions.find(category => category.name === "Contraband");
            if (contraband != null) {
                // TODO: Decrease Mirrorcatch Boxes count by 1
                let mirrorBoxes = contraband.possessions.find(item => item.name === "Mirrorcatch Box");
                if (mirrorBoxes) {
                    mirrorBoxCount = mirrorBoxes.level;
                }

                if (apocyanBoxAcquired) {
                    contraband.possessions.push(createApocyanicBox());
                    setFakeXhrResponse(this, 200, JSON.stringify(data));
                }
            }
        }

        if (targetUrl.endsWith("/api/storylet") || targetUrl.endsWith("/api/storylet/goback")) {
            actionCount = data.actions;

            if (currentSettingId === TARGET_SETTING && currentAreaId === TARGET_AREA) {
                if (data.phase === "Available") {
                    data.storylets.push(createEntryStorylet())
                    setFakeXhrResponse(this, 200, JSON.stringify(data));
                }
            }
        }
    }

    function openBypass(original_function) {
        return function (method, url, async) {
            this._targetUrl = url;
            this.addEventListener("readystatechange", parseResponse);
            return original_function.apply(this, arguments);
        };
    }

    function sendBypass(original_function) {
        return function (body) {
            if (this._targetUrl.endsWith("/begin")) {
                const requestData = JSON.parse(arguments[0]);
                if (requestData.eventId === APOCYAN_POINT_STORYLET_ID) {
                    setFakeXhrResponse(this, 200, JSON.stringify(createOpportunityStorylet()));
                    return this;
                }
            }

            if (this._targetUrl.endsWith("/choosebranch")) {
                const requestData = JSON.parse(arguments[0]);
                if (requestData.branchId === CATCH_APOCYAN_BRANCH_ID) {
                    log("Congratulations! Well done, my friend.");
                    localStorage.setItem(KEY_APOCYAN_ACQUIRED, "yes");
                    apocyanBoxAcquired = true;

                    const response = {
                        actions: actionCount,
                        canChangeOutfit: true,
                        endStorylet: {
                            rootEventId: APOCYAN_POINT_STORYLET_ID,
                            premiumBenefitsApply: true,
                            maxActionsAllowed: maxActions,
                            isLinkingEvent: false,
                            event: {
                                isInEventUseTree: false,
                                image: "apocyanic",
                                id: APOCYAN_POINT_STORYLET_ID + 1,
                                frequency: "Always",
                                description: "You remember. Fumbling for the spare box lined with mirrors. Fighting " +
                                    "off images that bubble up from the deepest recesses of your mind. Trying in vain " +
                                    "to catch that elusive radiance from the scintillack. You have succeeded. At least, " +
                                    "that is what you remember... And that is what counts, isn't it?",
                                name: "Engraved onto your eyelids.",
                            },
                            image: "apocyanic",
                            isDirectLinkingEvent: true,
                            canGoAgain: false,
                            currentActionsRemaining: actionCount,
                        },
                        isSuccess: true,
                        messages: [
                            {
                                priority: 2,
                                tooltip: "Filled to the brim by the elusive light refracted from the Zee-waves. " +
                                    "It reminds you of something, of a memory consigned to oblivion.",
                                type: "StandardQualityChangeMessage",
                                changeType: "Gained",
                                image: "apocyanic",
                                isSidebar: false,
                                message: "You've gained 1 x Apocyan-filled Mirrorcatch Box (new total 1). ",
                                possession: createApocyanicBox(),
                            },
                            {
                                changeType: "Lost",
                                image: "mirrorcatchboxclosed",
                                isSidebar: false,
                                message: `You've lost 1 x Mirrorcatch Box (new total ${mirrorBoxCount - 1})... Or not?`,
                                priority: 2,
                                tooltip: "The best way to store light, and certain other mysterious substances.",
                                type: "StandardQualityChangeMessage",
                                possession: createMirrorcatchBox(),
                            },
                        ],
                        phase: "End",
                    };

                    setFakeXhrResponse(this, 200, JSON.stringify(response));
                    return this;
                }
            }

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
        debug("Trying to fetch user info from server...");
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
                debug("Got FL auth token!");
            }
            return original_function.apply(this, arguments);
        }
    }

    debug("Setting up API interceptors.");
    XMLHttpRequest.prototype.send = sendBypass(XMLHttpRequest.prototype.send);
    XMLHttpRequest.prototype.open = openBypass(XMLHttpRequest.prototype.open);
    XMLHttpRequest.prototype.setRequestHeader = installAuthSniffer(XMLHttpRequest.prototype.setRequestHeader);
}())
