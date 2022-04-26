(function () {
    const DONE = 4;

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

        if (response.currentTarget.responseURL.includes("/api/character/myself")) {
            let data = JSON.parse(response.target.responseText);

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

    XMLHttpRequest.prototype.open = openBypass(XMLHttpRequest.prototype.open);

}())
