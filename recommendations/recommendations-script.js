const recommendedMediaList = document.querySelector("#recommended-media-list");
const unrecommendedMediaList = document.querySelector("#unrecommended-media-list");
const veryUnrecommendedMediaList = document.querySelector("#very-unrecommended-media-list");
const alreadyWatchedMediaList = document.querySelector("#already-watched-media-list");

let data, mediaData, prereqData;

async function fetchData() {
    let response = await fetch("../data.xml");
    if(!response.ok) throw new Error("Failed to connect to the server!");
    let responseXML = await response.text();
    data = new DOMParser().parseFromString(responseXML, "text/xml");
    mediaData = data.querySelector("mediaData").children;
    prereqData = data.querySelector("prereqData").children;
}

async function getRecommendations() {
    try {
        await fetchData()
        if(mediaData && mediaData.length > 0) {
            for(media of mediaData) {
                let mediaTitle = media.querySelector("title").textContent;
                let mediaType = media.querySelector("type").textContent;
                let mediaElement = document.createElement("ul");
                mediaElement.textContent = mediaTitle + " (" + mediaType + ")";

                if(localStorage.getItem(mediaTitle) == "true") alreadyWatchedMediaList.appendChild(mediaElement);
                else {
                    let hasMajorPrereq = false;
                    for(let prereq of media.querySelector("majorPrereqs").children) {
                        if(!prereqSatisfied(prereq)) hasMajorPrereq = true;
                    }
                    if(hasMajorPrereq) veryUnrecommendedMediaList.appendChild(mediaElement);
                    else {
                        let hasMinorPrereq = false;
                        for(let prereq of media.querySelector("minorPrereqs").children) {
                            if(!prereqSatisfied(prereq)) hasMinorPrereq = true;
                        }
                        if(hasMinorPrereq) unrecommendedMediaList.appendChild(mediaElement);
                        else recommendedMediaList.appendChild(mediaElement);
                    }
                }
            }
        }
        else throw new Error("We could not access the media list.");
    }
    catch(error) {
        console.error(error);
        alert(error);
    }
}

function prereqSatisfied(prereq) {
    let prereqTitle = prereq.textContent;
    if(prereq.tagName == "media") {
        return (localStorage.getItem(prereqTitle) == "true");
    }
    else {
        for(let prereq2 of prereqData) {
            if(prereq2.querySelector("title").textContent == prereqTitle) {
                for(let appearance of prereq2.querySelector("appearances").children) {
                    if(localStorage.getItem(appearance.textContent) == "true") return true;
                }
            }
        }
    }
    return false;
}

getRecommendations();