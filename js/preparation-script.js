const main = document.querySelector("main");
const heading = document.querySelector("#heading");
const essentialsOnlyCheckbox = document.querySelector("#essentials-only");
const essentialsOnlyLabel = document.querySelector("#essentials-only-label");
const listContainer = document.querySelector("#list-container");
const prereqList = document.querySelector("#prereq-list");

const mediaTitle = new URL(window.location.href).searchParams.get("title");

let mediaData, prereqData;

async function fetchData() {
    let response = await fetch("https://liamg-washu.github.io/mcu-guide/data.xml");
    if(!response.ok) throw new Error("Failed to connect to the server!");
    let responseXML = await response.text();
    let data = new DOMParser().parseFromString(responseXML, "text/xml");
    mediaData = data.querySelector("mediaData").children;
    prereqData = data.querySelector("prereqData").children;
}

function getMediaItem(title) {
    for(let mediaItem of mediaData) {
        if(mediaItem.querySelector("title").textContent == title) return mediaItem;
    }
}

function getPrereqItem(title) {
    for(let prereqItem of prereqData) {
        if(prereqItem.querySelector("title").textContent == title) return prereqItem;
    }
}

function findPrereqs(title) {
    let prereqMedia = [];
    let mediaItem = getMediaItem(title);
    let majorPrereqs = mediaItem.querySelector("majorPrereqs").children;
    let minorPrereqs = mediaItem.querySelector("minorPrereqs").children;
    let prereqs = (essentialsOnlyCheckbox.checked) ? majorPrereqs : [...majorPrereqs, ...minorPrereqs];
    for(let prereqTitle of prereqs) {
        if(prereqTitle.nodeName == "media") {
            let prereqMediaTitle = prereqTitle.textContent;
            if(!prereqMedia.includes(prereqMediaTitle)) prereqMedia.push(prereqMediaTitle);
            for(let newPrereq of findPrereqs(prereqMediaTitle)) {
                if(!prereqMedia.includes(newPrereq) && !localStorage.getItem(newPrereq)) prereqMedia.push(newPrereq);
            }
        }
        else {
            let prereqItem = getPrereqItem(prereqTitle.textContent);
            let prereqSatisfied = false;
            for(let appearance of prereqItem.querySelector("appearances").children) {
                if(prereqMedia.includes(appearance.textContent) || localStorage.getItem(appearance.textContent)) {
                    prereqSatisfied = true;
                }
            }
            if(!prereqSatisfied) {
                let prereqMediaTitle = prereqItem.querySelector("appearances").children[0].textContent;
                if(!prereqMedia.includes(prereqMediaTitle)) prereqMedia.push(prereqMediaTitle);
                for(let newPrereq of findPrereqs(prereqMediaTitle)) {
                    if(!prereqMedia.includes(newPrereq) && !localStorage.getItem(newPrereq)) prereqMedia.push(newPrereq);
                }
            }
        }
    }
    return prereqMedia;
}

async function displayPrereqs() {
    prereqList.replaceChildren();
    if(localStorage.getItem(mediaTitle)) {
        heading.textContent = "You have already watched " + mediaTitle + ".";
        essentialsOnlyCheckbox.classList.add("invisible");
        essentialsOnlyLabel.classList.add("invisible");
        listContainer.classList.add("invisible");
    }
    else try {
        await fetchData();
        if(mediaData && mediaData.length > 0) {
            prereqMedia = findPrereqs(mediaTitle);
            if(prereqMedia.length > 0) {
                heading.textContent = "Before you watch " + mediaTitle + ", you should watch these:"
                listContainer.classList.remove("invisible");
                for(let media of mediaData) {
                    if(prereqMedia.includes(media.querySelector("title").textContent)) {
                        let prereqMediaElement = document.createElement("li");
                        prereqMediaElement.textContent = media.querySelector("title").textContent;
                        prereqMediaElement.classList.add("info");
                        prereqList.appendChild(prereqMediaElement);
                    }
                }
            }
            else {
                heading.textContent = "You are ready to watch " + mediaTitle + "!";
                listContainer.classList.add("invisible");
            }
            essentialsOnlyCheckbox.classList.remove("invisible");
            essentialsOnlyLabel.classList.remove("invisible");
        }
        else throw new Error("We could not access the media list.");
    }
    catch(error) {
        console.error(error);
        alert(error);
    }
}

displayPrereqs();
essentialsOnlyCheckbox.addEventListener("click", function() {
    displayPrereqs();
});