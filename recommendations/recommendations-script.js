const recommendedFilmsList = document.querySelector("#recommended-films-list");
const unrecommendedFilmsList = document.querySelector("#unrecommended-films-list");
const veryUnrecommendedFilmsList = document.querySelector("#very-unrecommended-films-list");
const alreadyWatchedFilmsList = document.querySelector("#already-watched-films-list");
const recommendedSeriesList = document.querySelector("#recommended-series-list");
const unrecommendedSeriesList = document.querySelector("#unrecommended-series-list");
const veryUnrecommendedSeriesList = document.querySelector("#very-unrecommended-series-list");
const alreadyWatchedSeriesList = document.querySelector("#already-watched-series-list");
const mediaLists = document.querySelectorAll(".media-list");

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
                let mediaElement = document.createElement("li");
                mediaElement.textContent = mediaTitle;

                if(localStorage.getItem(mediaTitle) == "true") {
                    let mediaList = ((mediaType == "Film") ? (alreadyWatchedFilmsList) : (alreadyWatchedSeriesList));
                    mediaList.appendChild(mediaElement);
                }
                else {
                    let hasMajorPrereq = false;
                    for(let prereq of media.querySelector("majorPrereqs").children) {
                        if(!prereqSatisfied(prereq)) hasMajorPrereq = true;
                    }
                    if(hasMajorPrereq) {
                        let mediaList = ((mediaType == "Film") ? (veryUnrecommendedFilmsList) : (veryUnrecommendedSeriesList));
                        mediaList.appendChild(mediaElement);
                    }
                    else {
                        let hasMinorPrereq = false;
                        for(let prereq of media.querySelector("minorPrereqs").children) {
                            if(!prereqSatisfied(prereq)) hasMinorPrereq = true;
                        }
                        if(hasMinorPrereq) {
                            let mediaList = ((mediaType == "Film") ? (unrecommendedFilmsList) : (unrecommendedSeriesList));
                            mediaList.appendChild(mediaElement);
                        }
                        else {
                            let mediaList = ((mediaType == "Film") ? (recommendedFilmsList) : (recommendedSeriesList));
                            mediaList.appendChild(mediaElement);
                        }
                    }
                }
            }
        }
        else throw new Error("We could not access the media list.");
        for(let list of mediaLists) {
            if(list.children.length == 0) {
                let listEmptyMessage = document.createElement("span");
                listEmptyMessage.textContent = "None";
                list.appendChild(listEmptyMessage);
            }
        }
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